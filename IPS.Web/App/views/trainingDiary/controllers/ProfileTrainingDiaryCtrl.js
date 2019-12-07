angular.module('ips.trainingdiary')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseProfileTrainingDiaryResolve = {
            pageName: function ($translate) {
                return $translate.instant('HOME_PROFILE_TRAININGS');
            },
            taskList: function ($stateParams, trainingdiaryManager) {
                return trainingdiaryManager.getTaskListByUserId().then(function (data) {
                    return data;
                });
            },
            taskCategories: function ($stateParams, trainingdiaryManager, taskList) {
                if (taskList) {
                    return trainingdiaryManager.getTaskCategoriesById(taskList.taskCategoryListsId).then(function (data) {
                        return data;
                    });
                } else {
                    return [];
                }
            },
            taskStatuses: function ($stateParams, trainingdiaryManager, taskList) {
                if (taskList) {
                    return trainingdiaryManager.getTaskStatusesById(taskList.taskStatusListId).then(function (data) {
                        return data;
                    });
                } else {
                    return [];
                }
            },
            taskPriorities: function ($stateParams, trainingdiaryManager, taskList) {
                if (taskList) {
                    return trainingdiaryManager.getTaskPrioritiesById(taskList.taskPriorityListId).then(function (data) {
                        return data;
                    });
                }
                else {
                    return [];
                }
            },
        };
        $stateProvider
            .state('home.training.profiletrainingdiary', {
                url: "/profiletrainingdiary",
                templateUrl: "views/trainingDiary/views/profileTrainingDiary.html",
                controller: "profileTrainingDiaryCtrl",
                resolve: baseProfileTrainingDiaryResolve,
                data: {
                    displayName: '{{pageName}}',//'Training Diary',
                    paneLimit: 1,
                    depth: 2
                }
            })

    }])

    .controller("profileTrainingDiaryCtrl", ['$scope', 'cssInjector', '$stateParams', '$location', 'trainingdiaryManager', 'dialogService', 'apiService', 'authService', 'trainingSaveModeEnum', 'trainingsDiaryService', 'progressBar', 'localStorageService', 'taskList', 'taskCategories', 'taskStatuses', 'taskPriorities', '$compile', 'eventTypeEnum', 'trainingDiaryViewEnum', 'trainingStatusEnum', 'evaluationFeedbackEnum', 'Upload', '$translate', 'globalVariables',
        function ($scope, cssInjector, $stateParams, $location, trainingdiaryManager, dialogService, apiService, authService, trainingSaveModeEnum, trainingsDiaryService, progressBar, localStorageService, taskList, taskCategories, taskStatuses, taskPriorities, $compile, eventTypeEnum, trainingDiaryViewEnum, trainingStatusEnum, evaluationFeedbackEnum, Upload, $translate, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/trainingDiary/trainingDiary.min.css');
            cssInjector.add('views/trainingDiary/td-profile.css');
            cssInjector.add('views/trainingDiary/td-materials.css');
            $scope.trainingFeedBack = {
                trainingId: 0,
                rating: 0,
                workedWell: "",
                workedNotWell: "",
                whatNextDescription: "",
                taskId: 0,
                timeSpentMinutes: 0,
            };
            $scope.trainingDiaryViewEnum = trainingDiaryViewEnum;
            $scope.trainingStatus = {
                Done: $translate.instant('COMMON_DONE'),
                Active: $translate.instant('COMMON_ACTIVE'),
                Expired: $translate.instant('COMMON_EXPIRED'),
                Paused: $translate.instant('COMMON_PAUSED'),
                UpComing: $translate.instant('COMMON_UP_COMING'),
                PausedExpired: $translate.instant('COMMON_EXPIRED_AFTER_PAUSED')
            };
            $scope.trainingDiaryView = [{ Name: $translate.instant('COMMON_TODAY'), value: trainingDiaryViewEnum.Today },
            { Name: $translate.instant('COMMON_UPCOMING'), value: trainingDiaryViewEnum.UpComing },
            { Name: $translate.instant('COMMON_HISTORY'), value: trainingDiaryViewEnum.History }];
            $scope.evaluationFeedbackDDL = [{ Name: $translate.instant('COMMON_PARTICIPANT'), value: evaluationFeedbackEnum.Participant },
            { Name: $translate.instant('COMMON_EVALUATOR'), value: evaluationFeedbackEnum.Evaluator }];
            $scope.trainingDiaryViewId = trainingDiaryViewEnum.Today;
            $scope.evaluationFeedbackFor = evaluationFeedbackEnum.Participant;
            trainingsDiaryService.getOrganizations().then(function (data) {
                $scope.organizations = data;
            });
            trainingsDiaryService.getDurationMetrics().then(function (data) {
                $scope.durationMetrics = data;
            });
            moment.locale(globalVariables.lang.currentUICulture);
            var startWeek = moment();
            $scope.weekStartDate = startWeek.startOf("week")._d;
            var endWeek = moment();
            $scope.weekEndDate = endWeek.endOf('week')._d;
            var startDay = moment();
            $scope.dayStartDate = startDay.startOf("day")._d;
            var endDay = moment();
            $scope.dayEndDate = endDay.endOf('day')._d;
            $scope.filter = {
                organizationId: "",
                participantId: "",
                searchText: "",
                profileLevelId: null,
                jobPositionId: null,
                industryId: null,
                subIndustryId: null,
                subIndustryIds: [],
            }
            $scope.userStats = {
                userId: 0,
                firstName: "",
                lastName: "",
                email: "",
                image: "",
            }
            $scope.tasks = [];
            $scope.passedTrainingProfiles = [];
            $scope.profileStartDate = "";
            $scope.profileEndDate = "";
            $scope.activeProfileParticipant = "";
            $scope.activeProfileEvaluator = "";
            $scope.activeTraining = { id: 0, name: "", description: "" };
            $scope.openTrainingPopupMode = {
                isOpenNewTrainingPopup: false,
                isOpenAddExistingTrainingPopup: false
            }
            $scope.openProjectTrainingPopupMode = {
                isOpenNewTrainingPopup: false,
                isOpenAddExistingTrainingPopup: false
            }
            $scope.openTaskDetailPopupMode = {
                isPopupOpen: false
            }
            $scope.openTrainingNotePopupMode = {
                isOpenNewTrainingNotePopup: false,
            }
            $scope.evaluationAgreement = null;
            $scope.skills = [];
            $scope.notificationTemplates = [];
            $scope.activeSkill = null;
            $scope.currentUser = null;
            $scope.isOwnView = false;
            $scope.isActiveOwnView = false;
           
            $scope.activeTraining = { id: 0, name: "", description: "" };
            $scope.editingTraining = null;
            $scope.taskDetail = null;
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
            $scope.profileChanged = function (id, element, profile) {
                $scope.trainingStartDate = null;
                $scope.trainingEndDate = null;
                var isParticipantProfile = $scope.isParticipantProfile(profile);
                $scope.isOwnView = false;
                $scope.activeTraining = { id: 0, name: "", description: "" };
                var filterProfile = _.filter($scope.trainingProfiles, function (item) {
                    return item.profile.id == id && $scope.isParticipantProfile(item.profile) == isParticipantProfile;
                });
                $(".todo-project-list li").removeClass("active");
                $("#profile-list li").removeClass("active");
                if ($(element.target).is("li")) {
                    $(element.target).addClass("active")
                }
                else {
                    $(element.target).parents("li").addClass("active");
                }
                $scope.profileTrainingMaterials = [];
                if (filterProfile.length > 0) {
                    var filteredProfile = _.filter(filterProfile, function (item) {
                        return item.profile == profile;
                    })
                    if (filteredProfile.length > 0) {
                        $scope.activeProfile = filteredProfile[0];
                    }
                    else {
                        $scope.activeProfile = filterProfile[0];
                    }
                    $scope.activeProfileParticipant = "";
                    $scope.activeProfileEvaluator = "";
                    if (profile.evaluators.length > 0) {
                        $scope.activeProfileEvaluator = profile.evaluators[0].firstName + " " + profile.evaluators[0].lastName;
                    }
                    if (profile.participants.length > 0) {
                        $scope.activeProfileParticipant = profile.participants[0].firstName + " " + profile.participants[0].lastName;
                    }
                    LoadProfileTrainings()
                }
                console.log("profileChanged");
                $("[data-target='#tab_diary']").click();
                $scope.TabChange("diary");
            }
            $scope.stageChange = function (stageinfo) {
                $scope.activeStage = stageinfo;
                if ($scope.activeStage.evaluationAgreement.length > 0) {
                    if ($scope.activeStage.evaluationAgreement[0].trainings.length > 0) {
                        $scope.activeTraining = $scope.activeStage.evaluationAgreement[0].trainings[0];
                    }
                }
            }
            $scope.isFreeTextTrainingActive = function () {
                var result = false;
                if ($scope.activeProfile != null) {
                    if ($scope.activeProfile.ipsTrainingDiaryStages.length > 0) {
                        if ($scope.activeTraining) {
                            if ($scope.activeTraining.id <= 0) {
                                result = true;
                            }
                        }
                    }
                }
                return result;
            }
            $scope.isTrainingActive = function () {
                if ($scope.activeProfile != null) {
                    if ($scope.activeProfile.ipsTrainingDiaryStages.length > 0) {
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
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            $scope.trainingChanged = function (id, element, agreementId) {
                $scope.activeTraining = null;
                $scope.activeTraining = getselectedTraining(agreementId, id);
                if ($scope.activeTraining != null) {
                    if (!($scope.activeTraining.trainingFeedbacks)) {
                        $scope.activeTraining.trainingFeedbacks = [];
                    }
                    $("#trainingFeedbackGrid").html("");
                    $("#trainingFeedbackGrid").kendoGrid({
                        dataBound: $scope.onUserAssignGridDataBound,
                        dataSource: {
                            type: "json",
                            data: $scope.activeTraining.trainingFeedbacks,
                            pageSize: 10,
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
                            { field: "timeSpentMinutes", title: $translate.instant('COMMON_TIME_SPENT') + "(" + $translate.instant('COMMON_MINUTES') + ")", width: "20%" }
                        ],
                    });
                    $("#trainingFeedbackGrid").kendoTooltip({
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
                    $("#trainingmaterialGrid").html("");
                    $("#trainingmaterialGrid").kendoGrid({
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
                    $("#trainingmaterialGrid").kendoTooltip({
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
                    $compile($("#trainingmaterialGrid"))($scope);
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
           
            $scope.AddKPITraining = function (skill, evaluationAgreement) {
                var html = '<project-training-popup organization-id="currentUser.user.organizationId"' +
                    'user-id="currentUser.user.userId"' +
                    'open-project-training-popup-mode="openProjectTrainingPopupMode"' +
                    'save-mode="saveMode"' +
                    'editing-training="editingTraining"' +
                    'skill="activeSkill"' +
                    'evaluation-Agreement="evaluationAgreement"' +
                    'stage="activeStage">' +
                    '</project-training-popup>';
                var linkFn = $compile(html);
                var content = linkFn($scope);
                $("#project-training-popup-div").html(content);
                $scope.evaluationAgreement = evaluationAgreement;
                $scope.activeSkill = skill;
                $scope.saveMode = trainingSaveModeEnum.createkpi;
                $scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup = true;
            }
            $scope.SendProfileTrainingNotification = function (skill, evaluationAgreement) {
                if (evaluationAgreement.participantId) {
                    if (evaluationAgreement.trainings.length > 0) {
                        //Profile
                        _.forEach(evaluationAgreement.trainings, function (trainingItem) {
                            if (trainingItem.id > 0) {
                                var obj = { trainingId: trainingItem.id, participantId: evaluationAgreement.participantId, trainingType: "Profile" };
                                trainingdiaryManager.SendTrainingNotification(obj);
                            }
                        });
                    }
                }
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
           
            $scope.projectTrainingComplete = function (id) {
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
           
         
            $scope.IsAllowAddKPITraining = function (start, end) {
                var startdate = kendo.parseDate(start);
                var enddate = kendo.parseDate(end);
                var today = new Date();
                if (startdate < today && enddate > today) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.CheckStageStatus = function (start, end) {
                var startdate = kendo.parseDate(start);
                var enddate = kendo.parseDate(end);
                var today = new Date();
                if (startdate < today && enddate > today) {
                    return 1;
                }
                else {
                    if (startdate < today && enddate < today) {
                        return -1;
                    }
                    else {
                        return -2;
                    }
                }
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
            $scope.startRecurrenceTraining = function (id, recurrenceId) {
                localStorageService.set("RecurrenceDetail", null);
                if (recurrenceId < 0) {
                    var recurrenceObj = _.filter($scope.tasks, function (item) {
                        return item.orginalId == id && item.id == recurrenceId;
                    });
                    if (recurrenceObj.length > 0) {
                        localStorageService.set("RecurrenceDetail", recurrenceObj[0]);
                    }
                }
                if (id > 0) {
                    $location.path("/home/training/start/" + id);
                }
            }
            $scope.organizationChanged = organizationChanged;
            $scope.participantChanged = function (id) {
                CleanTrainingDiaryView();
                authService.getUserById(id).then(function (response) {
                    $scope.currentUser = response.data;
                    LoadTrainings();
                }, function () { });
            }
            $scope.searchByTraining = function (searchTxt) {
            }
            $scope.trainingDiaryViewChanged = function () {
                if ($("#userStatsUpComingTasksGrid").data("kendoGrid")) {
                    $("#userStatsUpComingTasksGrid").kendoGrid("destroy");
                    $("#userStatsUpComingTasksGrid").html("");
                }
                if ($("#userStatsTodayTasksGrid").data("kendoGrid")) {
                    $("#userStatsTodayTasksGrid").kendoGrid("destroy");
                    $("#userStatsTodayTasksGrid").html("");
                }
                if ($("#userStatsHistoryTasksGrid").data("kendoGrid")) {
                    $("#userStatsHistoryTasksGrid").kendoGrid("destroy");
                    $("#userStatsHistoryTasksGrid").html("");
                }
                moment.locale(globalVariables.lang.currentUICulture);
                var ds = new kendo.data.ObservableArray([]);
                if ($scope.activeProfile) {
                    var isParticipantActiveProfile = $scope.isParticipantProfile($scope.activeProfile.profile);
                    var ipsCalenderEventFilterModel = {
                        userId: $scope.currentUser.user.id,
                        startDate: null,
                        endDate: null
                    };
                    if ($scope.isPassedTrainingView) {
                        ipsCalenderEventFilterModel.startDate = kendo.parseDate($scope.profileStartDate);
                        ipsCalenderEventFilterModel.endDate = kendo.parseDate($scope.profileEndDate);
                    }
                    trainingsDiaryService.getEventsByUserId(ipsCalenderEventFilterModel).then(function (data) {
                        var allEventsData = data;
                        $scope.trainingNotesAvailableFor = [];
                        angular.forEach(data, function (item, index) {
                            var event = new kendo.data.SchedulerEvent({
                                id: item.id,
                                description: item.description,
                                title: item.title,
                                start: kendo.parseDate(item.start), //item1.start,
                                end: kendo.parseDate(item.end),
                                recurrenceRule: item.recurrenceRule,
                                eventType: item.eventType,
                                isAllDay: moment(kendo.parseDate(item.start)).format("HHmmss") == "000000",
                                color: item.eventType == eventTypeEnum.Task ? "#F6B94D" : "#C94D09",
                                taskListId: taskList ? taskList.id : 0,
                                statusId: item.statusId,
                                categoryId: item.categoryId,
                                priorityId: item.priorityId,
                                isPaused: false
                            });
                            var occurrences = event.expand(kendo.parseDate(item.start), kendo.parseDate(item.end));
                            var recurrence = -1;
                            angular.forEach(occurrences, function (item1, index1) {
                                var isRecurrenceDone = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                    if (item.eventType == eventTypeEnum.Task) {
                                        if (itemfeedback.recurrencesStartTime) {
                                            return itemfeedback.taskId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime();
                                        }
                                    }
                                    else {
                                        if (itemfeedback.recurrencesStartTime) {
                                            return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime() && itemfeedback.isParticipantPaused == false;
                                        }
                                    }
                                });
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
                                if (!occurrences[index1 + 1]) {
                                    if (endTime.getTime() > kendo.parseDate(item.end).getTime()) {
                                        endTime = moment(kendo.parseDate(item.end))._d;
                                    }
                                    if (item1.start.getTime() != endTime.getTime()) {
                                        ds.push({
                                            "orginalId": item.id,
                                            "id": recurrence,
                                            "description": item1.description,
                                            "title": item1.title,
                                            "start": kendo.parseDate(item1.start), //"/Date(1523511510858)/", //item1.start,
                                            "end": endTime, //"/Date(1523511510858)/"
                                            "isAllDay": false,
                                            "eventType": item1.eventType,
                                            "color": item.eventType == eventTypeEnum.Task ? "#F6B94D" : "#C94D09",
                                            "taskListId": taskList ? taskList.id : 0,
                                            "statusId": item.statusId,
                                            "categoryId": item.categoryId,
                                            "priorityId": item.priorityId,
                                            "recurrencesRule": item.recurrenceRule,
                                            "isDone": isRecurrenceDone.length > 0 ? true : false,
                                            "isPaused": item1.isPaused,
                                            "duration": item.duration ? item.duration : 0,
                                            "durationMetric": item.durationMetricId
                                        });
                                    }
                                }
                                else {
                                    ds.push({
                                        "orginalId": item.id,
                                        "id": recurrence,
                                        "description": item1.description,
                                        "title": item1.title,
                                        "start": kendo.parseDate(item1.start), //"/Date(1523511510858)/", //item1.start,
                                        "end": endTime, //"/Date(1523511510858)/"
                                        "isAllDay": false,
                                        "eventType": item1.eventType,
                                        "color": item.eventType == eventTypeEnum.Task ? "#F6B94D" : "#C94D09",
                                        "taskListId": taskList ? taskList.id : 0,
                                        "statusId": item.statusId,
                                        "categoryId": item.categoryId,
                                        "priorityId": item.priorityId,
                                        "recurrencesRule": item.recurrenceRule,
                                        "isDone": isRecurrenceDone.length > 0 ? true : false,
                                        "isPaused": item1.isPaused,
                                        "duration": item.duration ? item.duration : 0,
                                        "durationMetric": item.durationMetricId
                                    });
                                }
                                recurrence = recurrence - 1;
                            });
                        });
                        // Profile Trainings
                        $scope.profileTrainings = [];
                        if ($scope.activeProfile) {
                            _.forEach($scope.activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                                if (stageItem.evaluationAgreement) {
                                    _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                        if (evaluationAgreementItem.trainings) {
                                            _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                trainingItem["isParticipant"] = $scope.activeProfile.profile.participants.length > 0 ? true : false;
                                                if (trainingItem.isParticipant) {
                                                    trainingItem["participantName"] = $scope.activeProfile.profile.participants[0].firstName + " " + $scope.activeProfile.profile.participants[0].lastName;
                                                }
                                                else {
                                                    trainingItem["participantName"] = "";
                                                }
                                                trainingItem["isEvaluator"] = $scope.activeProfile.profile.evaluators.length > 0 ? true : false;
                                                if (trainingItem.isEvaluator) {
                                                    trainingItem["evaluatorName"] = $scope.activeProfile.profile.evaluators[0].firstName + " " + $scope.activeProfile.profile.evaluators[0].lastName;
                                                }
                                                else {
                                                    trainingItem["evaluatorName"] = "";
                                                }
                                                if (trainingItem.id) {
                                                    trainingsDiaryService.getTrainingNotes(trainingItem.id).then(function (notesData) {
                                                        if (notesData.length > 0) {
                                                            $scope.trainingNotesAvailableFor.push(trainingItem.id);
                                                        }
                                                    })
                                                }
                                                $scope.profileTrainings.push(trainingItem);
                                            })
                                        }
                                    });
                                }
                            })
                        }
                        angular.forEach($scope.profileTrainings, function (item, index) {
                            var event = new kendo.data.SchedulerEvent({
                                id: item.id,
                                description: item.additionalInfo,
                                title: item.name,
                                start: kendo.parseDate(item.startDate), //item1.start,
                                end: kendo.parseDate(item.endDate),
                                recurrenceRule: item.frequency,
                                eventType: eventTypeEnum.ProfileTraining,
                                isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                color: "#6CE26C",
                                taskListId: -1,
                                statusId: -1,
                                categoryId: -1,
                                priorityId: -1,
                                isParticipant: item.isParticipant,
                                participantName: item.participantName,
                                isEvaluator: item.isEvaluator,
                                evaluatorName: item.evaluatorName,
                                isPaused: false,
                                hasEvaluatorFeedback: false,
                            });
                            var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.endDate));
                            var recurrence = -1;
                            angular.forEach(occurrences, function (item1, index1) {
                                var isRecurrenceDone = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                    if (itemfeedback.recurrencesStartTime) {
                                        return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime() && itemfeedback.isParticipantPaused == false;
                                    }
                                });
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
                                var EvaluatorFeedbacks = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                    if (itemfeedback.recurrencesStartTime) {
                                        return itemfeedback.trainingId == item.id && (kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() < item1.start.getTime()) && itemfeedback.isEvaluatorFeedBack == true;
                                    }
                                });
                                if (EvaluatorFeedbacks.length > 0) {
                                    item1.hasEvaluatorFeedback = true;
                                }
                                var endTime = moment(item1.start).endOf("day")._d;
                                if (!(occurrences[index1 + 1])) {
                                    if (endTime.getTime() > kendo.parseDate(item.endDate).getTime()) {
                                        endTime = moment(kendo.parseDate(item.endDate))._d;
                                    }
                                    if (item1.start.getTime() != endTime.getTime()) {
                                        ds.push({
                                            "orginalId": item.id,
                                            "id": recurrence,
                                            "description": item1.description,
                                            "title": item1.title,
                                            "start": kendo.parseDate(item1.start), //"/Date(1523511510858)/", //item1.start,
                                            "end": endTime, //"/Date(1523511510858)/"
                                            "isAllDay": false,
                                            "eventType": eventTypeEnum.ProfileTraining,
                                            "color": "#6CE26C",
                                            "taskListId": -1,
                                            "statusId": -1,
                                            "categoryId": -1,
                                            "priorityId": -1,
                                            "isDone": isRecurrenceDone.length > 0 ? true : false,
                                            "isParticipant": item.isParticipant,
                                            "participantName": item.participantName,
                                            "isEvaluator": item.isEvaluator,
                                            "evaluatorName": item.evaluatorName,
                                            "isPaused": item1.isPaused,
                                            "hasEvaluatorFeedback": item1.hasEvaluatorFeedback,
                                            "duration": item.duration ? item.duration : 0,
                                            "durationMetric": item.durationMetricId,
                                        })
                                    }
                                }
                                else {
                                    ds.push({
                                        "orginalId": item.id,
                                        "id": recurrence,
                                        "description": item1.description,
                                        "title": item1.title,
                                        "start": kendo.parseDate(item1.start), //"/Date(1523511510858)/", //item1.start,
                                        "end": endTime, //"/Date(1523511510858)/"
                                        "isAllDay": false,
                                        "eventType": eventTypeEnum.ProfileTraining,
                                        "color": "#6CE26C",
                                        "taskListId": -1,
                                        "statusId": -1,
                                        "categoryId": -1,
                                        "priorityId": -1,
                                        "isDone": isRecurrenceDone.length > 0 ? true : false,
                                        "isParticipant": item.isParticipant,
                                        "participantName": item.participantName,
                                        "isEvaluator": item.isEvaluator,
                                        "evaluatorName": item.evaluatorName,
                                        "isPaused": item1.isPaused,
                                        "hasEvaluatorFeedback": item1.hasEvaluatorFeedback,
                                        "duration": item.duration,
                                        "durationMetric": item.durationMetricId,
                                    });
                                }
                                recurrence = recurrence - 1;
                            });
                        });
                        var today = new Date();
                        today = today.setHours(0, 0, 0, 0);
                        $scope.events = [];
                        $scope.tasks = [];
                        $scope.today = today;
                        var startDates = [];
                        var endDates = [];
                        _.filter(ds, function (item) {
                            if ($scope.isPassedTrainingView) {
                                if (isParticipantActiveProfile) {
                                    if (item.isParticipant) {
                                        item["role"] = "Participant";
                                        item["user"] = $scope.activeProfileParticipant;
                                        $scope.events.push(item);
                                    }
                                }
                                else {
                                    if (item.isParticipant) {
                                        item["role"] = "Participant";
                                        item["user"] = $scope.activeProfileParticipant;
                                    }
                                    else {
                                        if (item.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                            item["role"] = "Evaluator";
                                            if ($scope.activeProfileEvaluator) {
                                                item["user"] = $scope.activeProfileEvaluator;
                                            }
                                            else {
                                                item["user"] = "";
                                            }
                                        }
                                        else {
                                            item["role"] = "";
                                            item["user"] = $scope.currentUser.user.firstName + " " + $scope.currentUser.user.lastName;
                                        }
                                    }
                                    $scope.events.push(item);
                                }
                            }
                            else {
                                var itemStartDateTime = _.clone(item.start);
                                if (kendo.parseDate(itemStartDateTime).setHours(0, 0, 0, 0) > today) {
                                    if (isParticipantActiveProfile) {
                                        if (item.isParticipant) {
                                            item["role"] = "Participant";
                                            item["user"] = $scope.activeProfileParticipant;
                                            $scope.events.push(item);
                                        }
                                    }
                                    else {
                                        if (item.isParticipant) {
                                            item["role"] = "Participant";
                                            item["user"] = $scope.activeProfileParticipant;
                                        } else {
                                            if (item.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                                item["role"] = "Evaluator";
                                                if ($scope.activeProfileEvaluator) {
                                                    item["user"] = $scope.activeProfileEvaluator;
                                                }
                                                else {
                                                    item["user"] = "";
                                                }
                                            }
                                            else {
                                                item["role"] = "Participant";
                                                item["user"] = $scope.currentUser.user.firstName + " " + $scope.currentUser.user.lastName;
                                            }
                                        }
                                        $scope.events.push(item);
                                    }
                                }
                                else if (kendo.parseDate(itemStartDateTime).setHours(0, 0, 0, 0) == today) {
                                    if (isParticipantActiveProfile) {
                                        if (item.isParticipant) {
                                            item["role"] = "Participant";
                                            item["user"] = $scope.activeProfileParticipant;
                                            $scope.tasks.push(item);
                                        }
                                    }
                                    else {
                                        if (item.isParticipant) {
                                            item["role"] = "Participant";
                                            item["user"] = $scope.activeProfileParticipant;
                                        } else {
                                            if (item.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                                item["role"] = "Evaluator";
                                                if ($scope.activeProfileEvaluator) {
                                                    item["user"] = $scope.activeProfileEvaluator;
                                                }
                                                else {
                                                    item["user"] = "Participant";
                                                }
                                            }
                                            else {
                                                item["role"] = "Participant";
                                                item["user"] = $scope.currentUser.user.firstName + " " + $scope.currentUser.user.lastName;
                                            }
                                        }
                                        $scope.tasks.push(item);
                                    }
                                }
                            }
                        });
                        if ($scope.trainingDiaryViewId == trainingDiaryViewEnum.Today) {
                            $("#userStatsTodayTasksGrid").kendoGrid({
                                dataBound: $scope.onUserAssignGridDataBound,
                                dataSource: {
                                    data: $scope.tasks,
                                    pageSize: 10,
                                },
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
                                        field: "title", title: $translate.instant('COMMON_TITLE'), width: "120px"
                                    },
                                    {
                                        field: "start",
                                        title: $translate.instant('COMMON_START'),
                                        width: "120px",
                                        template: function (data, value) {
                                            return moment(kendo.parseDate(data.start)).format('L LT')
                                        }
                                    },
                                    {
                                        field: "end",
                                        title: $translate.instant('COMMON_END'),
                                        width: "100px",
                                        template: function (data, value) {
                                            return moment(kendo.parseDate(data.end)).format('L LT')
                                        }
                                    },
                                    {
                                        field: "eventType",
                                        title: $translate.instant('COMMON_EVENT_TYPE'),
                                        width: "150px",
                                        template: function (data, value) {
                                            if (data.eventType == eventTypeEnum.Task) {
                                                return 'Task';
                                            }
                                           
                                            else if (data.eventType == eventTypeEnum.ProfileTraining) {
                                                return 'Profile Training';
                                            }
                                            else if (data.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                                return 'Evaluate Participant Training';
                                            }
                                        }
                                    },
                                    {
                                        field: "role",
                                        title: $translate.instant('COMMON_ROLE'),
                                        width: "120px",
                                    },
                                    {
                                        field: "user",
                                        title: $translate.instant('COMMON_USER'),
                                        width: "110px",
                                    },
                                    {
                                        field: "orginalId",
                                        title: $translate.instant('COMMON_SPENT') + "(" + $translate.instant('COMMON_MIN') + ")",
                                        width: "160px",
                                        template: function (data) {
                                            if (!(data.eventType == 1)) {
                                                var spentMinites = 0;
                                                var trainingToday = _.find($scope.profileTrainings, function (profileTrainingItem) {
                                                    return profileTrainingItem.id == data.orginalId;
                                                });
                                                if (!trainingToday) {
                                                    trainingToday = _.find(allEventsData, function (allEventsDataItem) {
                                                        return allEventsDataItem.id == data.orginalId;
                                                    });
                                                }
                                                if (trainingToday) {
                                                    _.each(trainingToday.trainingFeedbacks, function (trainingFeedbackItem) {
                                                        var end = moment(kendo.parseDate(data.end)).set({ seconds: 0, milliseconds: 0 })._d.getTime();
                                                        var recurrenceEnd = moment(kendo.parseDate(trainingFeedbackItem.recurrencesEndTime)).set({ seconds: 0, milliseconds: 0 })._d.getTime();
                                                        var start = moment(kendo.parseDate(data.start)).set({ seconds: 0, milliseconds: 0 })._d.getTime();
                                                        var recurrenceStart = moment(kendo.parseDate(trainingFeedbackItem.recurrencesStartTime)).set({ seconds: 0, milliseconds: 0 })._d.getTime();
                                                        if (end == recurrenceEnd && start == recurrenceStart) {
                                                            var isTrainingFinished = true;
                                                            if (trainingFeedbackItem.isParticipantPaused == true) {
                                                                var finishedTraining = _.filter(trainingToday.trainingFeedbacks, function (feedbackItem) {
                                                                    return trainingFeedbackItem.recurrencesStartTime == feedbackItem.recurrencesStartTime && trainingFeedbackItem.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                                                });
                                                                if (finishedTraining.length > 0) {
                                                                    isTrainingFinished = true
                                                                }
                                                                else {
                                                                    isTrainingFinished = false;
                                                                }
                                                            }
                                                            if (!(trainingFeedbackItem.isParticipantPaused == true && isTrainingFinished == true)) {
                                                                spentMinites += trainingFeedbackItem.timeSpentMinutes;
                                                            }
                                                        }
                                                    })
                                                }
                                                return spentMinites;
                                            }
                                            else {
                                                return "";
                                            }
                                        }
                                    },
                                    {
                                        field: "orginalId",
                                        title: $translate.instant('TRAININGDAIRY_PLANNED') + "(" + $translate.instant('COMMON_MIN') + ")",
                                        width: "170px",
                                        template: function (data) {
                                            if (!(data.eventType == 1)) {
                                                if (data.durationMetric == 1) {
                                                    //Hour
                                                    return (data.duration * 60);
                                                }
                                                if (data.durationMetric == 3) {
                                                    //Minutes
                                                    return (data.duration);
                                                }
                                                if (data.durationMetric == 4) {
                                                    //Seconds
                                                    return (data.duration / 60);
                                                }
                                                if (data.durationMetric == 5) {
                                                    //Days
                                                    return (data.duration * 1440);
                                                }
                                            }
                                            else {
                                                return "";
                                            }
                                        }
                                    },
                                    {
                                        field: "orginalId",
                                        title: $translate.instant('TRAININGDAIRY_RESULT') + "(" + $translate.instant('COMMON_MIN') + ")",
                                        width: "170px",
                                        template: function (data) {
                                            if (!(data.eventType == 1)) {
                                                var spentMinites = 0;
                                                var trainingToday = _.find($scope.profileTrainings, function (profileTrainingItem) {
                                                    return profileTrainingItem.id == data.orginalId;
                                                });
                                                if (!trainingToday) {
                                                    trainingToday = _.find(allEventsData, function (allEventsDataItem) {
                                                        return allEventsDataItem.id == data.orginalId;
                                                    });
                                                }
                                                if (trainingToday) {
                                                    _.each(trainingToday.trainingFeedbacks, function (trainingFeedbackItem) {
                                                        var end = moment(kendo.parseDate(data.end)).set({ seconds: 0, milliseconds: 0 })._d.getTime();
                                                        var recurrenceEnd = moment(kendo.parseDate(trainingFeedbackItem.recurrencesEndTime)).set({ seconds: 0, milliseconds: 0 })._d.getTime();
                                                        var start = moment(kendo.parseDate(data.start)).set({ seconds: 0, milliseconds: 0 })._d.getTime();
                                                        var recurrenceStart = moment(kendo.parseDate(trainingFeedbackItem.recurrencesStartTime)).set({ seconds: 0, milliseconds: 0 })._d.getTime();
                                                        if (end == recurrenceEnd && start == recurrenceStart) {
                                                            var isTrainingFinished = true;
                                                            if (trainingFeedbackItem.isParticipantPaused == true) {
                                                                var finishedTraining = _.filter(trainingToday.trainingFeedbacks, function (feedbackItem) {
                                                                    return trainingFeedbackItem.recurrencesStartTime == feedbackItem.recurrencesStartTime && trainingFeedbackItem.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                                                });
                                                                if (finishedTraining.length > 0) {
                                                                    isTrainingFinished = true
                                                                }
                                                                else {
                                                                    isTrainingFinished = false;
                                                                }
                                                            }
                                                            if (!(trainingFeedbackItem.isParticipantPaused == true && isTrainingFinished == true)) {
                                                                spentMinites += trainingFeedbackItem.timeSpentMinutes;
                                                            }
                                                        }
                                                    })
                                                }
                                                var planned = 0;
                                                if (data.durationMetric == 1) {
                                                    //Hour
                                                    planned = (data.duration * 60);
                                                }
                                                if (data.durationMetric == 3) {
                                                    //Minutes
                                                    planned = (data.duration);
                                                }
                                                if (data.durationMetric == 4) {
                                                    //Seconds
                                                    planned = (data.duration / 60);
                                                }
                                                if (data.durationMetric == 5) {
                                                    //Days
                                                    planned = (data.duration * 1440);
                                                }
                                                var cssClass = $scope.isTrainingTargetPending(spentMinites, planned);
                                                var htmlResult = '<i class="font-sm  fa ' + cssClass + ' "></i>';
                                                htmlResult += $scope.trainingHourResult(spentMinites, planned);
                                                return htmlResult;
                                            }
                                            else {
                                                return "";
                                            }
                                        }
                                    },
                                    {
                                        field: "orginalId", title: $translate.instant('COMMON_ACTION'), width: "130px", filterable: false, sortable: false, template: function (data) {
                                            var result = '<div class="icon-groups"><a class="fa fa-eye fa-lg" href="javascript:;" title="View Detail" ng-click="openAgendaDetail(' + data.eventType + ',' + data.orginalId + ',$event)"></a> '
                                            result += "<a href='javascript:;' class='fa fa-list fa-lg' title='History' ng-click='viewHistory(\"" + data.title + "\"," + data.eventType + "," + data.orginalId + ")'></a>";
                                            result += "<a href='javascript:;' class='fa fa-plus-square fa-lg' title='Add New Training Note' ng-show='isAllowedToAddNote(" + data.eventType + "," + data.orginalId + ")' ng-click='addTrainingNote(" + data.orginalId + ")'></a>";

                                            result += "<a href='javascript:;' class='fa fa-outdent fa-lg' title='All Training Notes' ng-show='hasTrainingNotes(" + data.orginalId + ")' ng-click='viewTrainingNotes(\"" + data.title + "\"," + data.orginalId + ")'></a>";
                                            if (!($scope.isPassedTrainingView)) {
                                                if (data.eventType == 1 && data.isDone != true) {
                                                    result += "<a href='javascript:;' class='fa fa-check-square-o fa-lg' title='Completed' ng-click='recurrenceTaskCompleted(\"" + data.orginalId + "\"," + data.id + " )'></a>";
                                                }
                                                if ((data.eventType != 1 && data.isDone != true) && (!data.isParticipant)) {
                                                    if (data.isPaused == true) {
                                                        if (data.eventType != eventTypeEnum.EvaluateParticipantTraining) {
                                                            result += "<a href='javascript:;' class='fa fa-refresh fa-lg' title='Restart Training' ng-click='startRecurrenceTraining(\"" + data.orginalId + "\"," + data.id + " )'></a>";
                                                        }
                                                    } else {
                                                        if (data.eventType != eventTypeEnum.EvaluateParticipantTraining) {
                                                            result += "<a href='javascript:;' class='fa fa-play fa-lg' title='Start Training' ng-click='startRecurrenceTraining(\"" + data.orginalId + "\"," + data.id + " )'></a>";
                                                        }
                                                    }
                                                }
                                                if (data.hasEvaluatorFeedback) {
                                                    if (data.isParticipant) {
                                                        result += "<a href='javascript:;' class='fa fa-list fa-lg' title='Your Feedbacks as Evaluator' ng-click='viewEvaluatorFeedbacks(\"" + data.title + "\"," + data.eventType + "," + data.orginalId + ")'></a>";
                                                    }
                                                    else {
                                                        result += "<a href='javascript:;' class='fa fa-list fa-lg' title='Evaluator Feedbacks' ng-click='viewEvaluatorFeedbacks(\"" + data.title + "\"," + data.eventType + "," + data.orginalId + ")'></a>";
                                                    }
                                                }
                                            }
                                            result += "</div>";
                                            return result;
                                        }
                                    },
                                ],
                            });
                            $("#userStatsTodayTasksGrid").kendoTooltip({
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
                            $compile($("#userStatsTodayTasksGrid"))($scope);
                        }
                        if ($scope.trainingDiaryViewId == trainingDiaryViewEnum.UpComing) {
                            if ($scope.isPassedTrainingView) {
                                $scope.events = _.filter($scope.events, function (recurrenceItem) {
                                    return recurrenceItem.orginalId > 0 && recurrenceItem.id == -1;
                                })
                                $("#userStatsUpComingTasksGrid").kendoGrid({
                                    dataBound: $scope.onUserAssignGridDataBound,
                                    dataSource: {
                                        data: $scope.events,
                                        pageSize: 10,
                                    },
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
                                            field: "title", title: $translate.instant('COMMON_TITLE'), width: "120px",
                                        },
                                        {
                                            field: "start",
                                            title: $translate.instant('COMMON_START'),
                                            width: "150px",
                                            template: function (data, value) {
                                                return moment(kendo.parseDate(data.start)).format('L LT');
                                            }
                                        },
                                        {
                                            field: "end",
                                            title: $translate.instant('COMMON_END'),
                                            width: "150px",
                                            template: function (data, value) {
                                                return moment(kendo.parseDate(data.end)).format('L LT');
                                            }
                                        },
                                        {
                                            field: "eventType",
                                            title: $translate.instant('COMMON_EVENT_TYPE'),
                                            width: "160px",
                                            template: function (data, value) {
                                                if (data.eventType == eventTypeEnum.Task) {
                                                    return 'Task';
                                                }
                                               
                                                else if (data.eventType == eventTypeEnum.ProfileTraining) {
                                                    return 'Profile Training';
                                                }
                                                else if (data.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                                    return 'Evaluate Participant Training';
                                                }
                                            }
                                        },
                                        {
                                            field: "role",
                                            title: $translate.instant('COMMON_ROLE'),
                                            width: "120px",
                                        },
                                        {
                                            field: "user",
                                            title: $translate.instant('COMMON_USER'),
                                            width: "120px",
                                        },
                                        {
                                            field: "orginalId", title: $translate.instant('COMMON_ACTION'), width: "120px", filterable: false, sortable: false, template: function (data) {
                                                var result = '<div class="icon-groups"><a class="fa fa-eye fa-lg" title="View Detail" href="javascript:;" ng-click="openAgendaDetail(' + data.eventType + ',' + data.orginalId + ',$event)"></a> '
                                                result += "<a href='javascript:;' class='fa fa-plus-square fa-lg' title='Add New Training Note' ng-show='isAllowedToAddNote(" + data.eventType + "," + data.orginalId + ")' ng-click='addTrainingNote(" + data.orginalId + ")'></a>";
                                                result += "<a href='javascript:;' class='fa fa-outdent fa-lg' title='All Training Notes' ng-show='hasTrainingNotes(" + data.orginalId + ")' ng-click='viewTrainingNotes(\"" + data.title + "\"," + data.orginalId + ")'></a>";
                                                if ($scope.isPassedTrainingView) {
                                                    result += "<a href='javascript:;' class='fa fa-list fa-lg' title='History' ng-click='viewHistory(\"" + data.title + "\"," + data.eventType + "," + data.orginalId + ")'></a>";
                                                }
                                                result += "</div>"
                                                return result;
                                            }
                                        },
                                    ],
                                });
                            }
                            else {
                                $("#userStatsUpComingTasksGrid").kendoGrid({
                                    dataBound: $scope.onUserAssignGridDataBound,
                                    dataSource: {
                                        data: $scope.events,
                                        pageSize: 10,
                                        group: { field: "orginalId", field: "title" },
                                    },
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
                                            field: "title", title: $translate.instant('COMMON_TITLE')
                                        },
                                        {
                                            field: "start",
                                            title: $translate.instant('COMMON_START'),
                                            template: function (data, value) {
                                                return moment(kendo.parseDate(data.start)).format('L LT')
                                            }
                                        },
                                        {
                                            field: "end",
                                            title: $translate.instant('COMMON_END'),
                                            template: function (data, value) {
                                                return moment(kendo.parseDate(data.end)).format('L LT')
                                            }
                                        },
                                        {
                                            field: "eventType",
                                            title: $translate.instant('COMMON_EVENT_TYPE'),
                                            template: function (data, value) {
                                                if (data.eventType == eventTypeEnum.Task) {
                                                    return 'Task';
                                                }
                                               
                                                else if (data.eventType == eventTypeEnum.ProfileTraining) {
                                                    return 'Profile Training';
                                                }
                                                else if (data.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                                    return 'Evaluate Participant Training';
                                                }
                                            }
                                        },
                                        {
                                            field: "role",
                                            title: $translate.instant('COMMON_ROLE'),
                                        },
                                        {
                                            field: "user",
                                            title: $translate.instant('COMMON_USER'),
                                        },
                                        {
                                            field: "orginalId", title: $translate.instant('COMMON_ACTION'), filterable: false, sortable: false, template: function (data) {
                                                var result = '<div class="icon-groups"><a class="fa fa-eye fa-lg" title="View Detail" href="javascript:;" ng-click="openAgendaDetail(' + data.eventType + ',' + data.orginalId + ',$event)"></a> '
                                                result += "<a href='javascript:;' class='fa fa-plus-square fa-lg' title='Add New Training Note' ng-show='isAllowedToAddNote(" + data.eventType + "," + data.orginalId + ")' ng-click='addTrainingNote(" + data.orginalId + ")'></a>";
                                                result += "<a href='javascript:;' class='fa fa-outdent fa-lg' title='All Training Notes' ng-show='hasTrainingNotes(" + data.orginalId + ")' ng-click='viewTrainingNotes(\"" + data.title + "\"," + data.orginalId + ")'></a>";
                                                if ($scope.isPassedTrainingView) {
                                                    result += "<a href='javascript:;' class='fa fa-list fa-lg' title='History' ng-click='viewHistory(\"" + data.title + "\"," + data.eventType + "," + data.orginalId + ")'></a>";
                                                }
                                                result += "</div>";
                                                return result;
                                            }
                                        },
                                    ],
                                });
                            }
                            $("#userStatsUpComingTasksGrid").kendoTooltip({
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
                            $compile($("#userStatsUpComingTasksGrid"))($scope);
                        }
                        if ($scope.trainingDiaryViewId == trainingDiaryViewEnum.History) {
                            if ($scope.isPassedTrainingView) {
                                $scope.trainingDiaryViewStartDate = moment(kendo.parseDate($scope.profileStartDate)).format('L LT');
                                $scope.trainingDiaryViewEndDate = moment(kendo.parseDate($scope.profileEndDate)).format('L LT');
                            }
                            else {
                                var endTime = moment(new Date()).add(-1, "days").endOf("day")._d;
                                if ($scope.activeProfile) {
                                    if ($scope.activeProfile.ipsTrainingDiaryStages.length > 0) {
                                        $scope.trainingDiaryViewStartDate = moment(kendo.parseDate($scope.activeProfile.ipsTrainingDiaryStages[0].startDate)).format('L LT');
                                        $scope.trainingDiaryViewEndDate = moment(kendo.parseDate(endTime)).format('L LT');
                                        $scope.loadHistoryTraining()
                                    }
                                }
                            }
                        }
                    });
                }
            };
            $scope.evaluationFeedbackDDLChanged = function () {
                $scope.evaluationFeedbackFor;
                if ($scope.evaluationFeedbackFor == evaluationFeedbackEnum.Participant) {
                    $scope.feedbacks = [];
                    $scope.allFeedbacks = [];
                    angular.forEach($scope.profileTrainings, function (item, index) {
                        _.each(item.trainingFeedbacks, function (itemfeedback) {
                            if (itemfeedback.trainingId == item.id && itemfeedback.isParticipantPaused == false && (!itemfeedback.evaluatorId > 0)) {
                                $scope.allFeedbacks.push(itemfeedback);
                                $scope.feedbacks.push({
                                    "orginalId": itemfeedback.trainingId,
                                    "id": itemfeedback.id,
                                    "name": item.name,
                                    "start": kendo.parseDate(itemfeedback.recurrencesStartTime), //"/Date(1523511510858)/", //item1.start,
                                    "end": kendo.parseDate(itemfeedback.recurrencesEndTime), //"/Date(1523511510858)/"
                                    "eventType": eventTypeEnum.ProfileTraining,
                                    "rating": itemfeedback.rating,
                                    "feedbackDateTime": kendo.parseDate(itemfeedback.feedbackDateTime),
                                    "workedWell": itemfeedback.workedWell,
                                    "workedNotWell": itemfeedback.workedNotWell,
                                    "whatNextDescription": itemfeedback.whatNextDescription,
                                    "timeSpentMinutes": itemfeedback.timeSpentMinutes,
                                    "startedAt": kendo.parseDate(itemfeedback.startedAt)
                                })
                            }
                        });
                    });
                    if ($("#userStatsEvaluationFeedbackGrid").data("kendoGrid")) {
                        $("#userStatsEvaluationFeedbackGrid").kendoGrid("destroy");
                        $("#userStatsEvaluationFeedbackGrid").html("");
                    }
                    var sortedFeedbacks = _.sortBy($scope.feedbacks, function (o) { return o.feedbackDateTime; }).reverse();
                    $scope.feedbacks = _.unique(sortedFeedbacks, function (o) {
                        return o.id;
                    });
                    $("#userStatsEvaluationFeedbackGrid").kendoGrid({
                        dataBound: $scope.onUserAssignGridDataBound,
                        dataSource: {
                            data: $scope.feedbacks,
                            pageSize: 10,
                        },
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
                        resizable: true,
                        columns: [
                            { field: "name", title: $translate.instant('COMMON_NAME'), width: "130px" },
                            {
                                field: "start", title: $translate.instant('COMMON_RECURRENCE_START_TIME'), width: "240px", template: function (dataItem) {
                                    if (dataItem.start) {
                                        return moment(kendo.parseDate(dataItem.start)).format('L LT');
                                    }
                                    else {
                                        return '';
                                    }
                                }
                            },
                            {
                                field: "end", title: $translate.instant('COMMON_RECURRENCE_END_TIME'), width: "240px", template: function (dataItem) {
                                    if (dataItem.end) {
                                        return moment(kendo.parseDate(dataItem.end)).format('L LT');
                                    }
                                    else {
                                        return '';
                                    }
                                }
                            },
                            {
                                field: "startedAt", title: $translate.instant('COMMON_TRAINING_STARTED'), width: "200px", template: function (dataItem) {
                                    if (dataItem.startedAt) {
                                        return moment(kendo.parseDate(dataItem.startedAt)).format('L LT');
                                    }
                                    else {
                                        return '';
                                    }
                                }
                            },
                            {
                                field: "feedbackDateTime", title: $translate.instant('COMMON_TRAINING_ENDED'), width: "180px", template: function (dataItem) {
                                    if (dataItem.feedbackDateTime) {
                                        return moment(kendo.parseDate(dataItem.feedbackDateTime)).format('L LT');
                                    }
                                    else {
                                        return '';
                                    }
                                }
                            },
                            { field: "workedWell", title: $translate.instant('COMMON_WORKED_WELL'), width: "160px", },
                            { field: "workedNotWell", title: $translate.instant('COMMON_WORKED_NOT_WELL'), width: "200px", },
                            { field: "whatNextDescription", title: $translate.instant('COMMON_WHAT_NEXT'), width: "180px", },
                            {
                                field: "rating", title: $translate.instant('COMMON_RATING'), width: "130px", template: function (data) {
                                    var template = "";
                                    for (var i = 0; i < data.rating; i++) {
                                        template += "<span><label class='fa fa-star fa-fw selected'></label></span>";
                                    }
                                    return template;
                                }
                            },
                            { field: "timeSpentMinutes", title: $translate.instant('COMMON_TIME_SPENT'), width: "160px", },
                            { field: "id", title: $translate.instant('COMMON_ACTION'), width: "150px", filterable: false, sortable: false, template: "<div class='icon-groups'><a href='javascript:;' class='fa fa-pencil' title='edit' ng-click='editEvaluationFeedback(#:id#)'></a> <a href='javascript:;' class='fa fa-eye' title='view' ng-click='viewEvaluationFeedback(#:id#)'></a></div>", filterable: false, sortable: false, }
                        ],
                    });
                    $("#userStatsEvaluationFeedbackGrid").kendoTooltip({
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
                    $compile($("#userStatsEvaluationFeedbackGrid"))($scope);
                }
                else if ($scope.evaluationFeedbackFor == evaluationFeedbackEnum.Evaluator) {
                    $scope.feedbacks = [];
                    $scope.allFeedbacks = [];
                    angular.forEach($scope.profileTrainings, function (item, index) {
                        _.each(item.trainingFeedbacks, function (itemfeedback) {
                            if (itemfeedback.trainingId == item.id && itemfeedback.isParticipantPaused == false && itemfeedback.isEvaluatorFeedBack == true) {
                                $scope.allFeedbacks.push(itemfeedback);
                                $scope.feedbacks.push({
                                    "orginalId": itemfeedback.trainingId,
                                    "id": itemfeedback.id,
                                    "name": item.name,
                                    "start": kendo.parseDate(itemfeedback.recurrencesStartTime), //"/Date(1523511510858)/", //item1.start,
                                    "end": kendo.parseDate(itemfeedback.recurrencesEndTime), //"/Date(1523511510858)/"
                                    "eventType": eventTypeEnum.ProfileTraining,
                                    "rating": itemfeedback.rating,
                                    "feedbackDateTime": kendo.parseDate(itemfeedback.evaluatorFeedBackTime),
                                    "workedWell": itemfeedback.workedWell,
                                    "workedNotWell": itemfeedback.workedNotWell,
                                    "whatNextDescription": itemfeedback.whatNextDescription,
                                    "timeSpentMinutes": itemfeedback.timeSpentMinutes,
                                    "startedAt": kendo.parseDate(itemfeedback.startedAt)
                                })
                            }
                        });
                    });
                    if ($("#userStatsEvaluationFeedbackGrid").data("kendoGrid")) {
                        $("#userStatsEvaluationFeedbackGrid").kendoGrid("destroy");
                        $("#userStatsEvaluationFeedbackGrid").html("");
                    }
                    var sortedFeedbacks = _.sortBy($scope.feedbacks, function (o) { return o.feedbackDateTime; }).reverse();
                    $scope.feedbacks = sortedFeedbacks;
                    $("#userStatsEvaluationFeedbackGrid").kendoGrid({
                        dataBound: $scope.onUserAssignGridDataBound,
                        dataSource: {
                            data: $scope.feedbacks,
                            pageSize: 10,
                        },
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
                        resizable: true,
                        columns: [
                            { field: "name", title: $translate.instant('COMMON_NAME'), width: "120px" },
                            {
                                field: "start", title: $translate.instant('COMMON_RECURRENCE_START_TIME'), width: "240px", template: function (dataItem) {
                                    if (dataItem.start) {
                                        return moment(kendo.parseDate(dataItem.start)).format('L LT');
                                    }
                                    else {
                                        return '';
                                    }
                                }
                            },
                            {
                                field: "end", title: $translate.instant('COMMON_RECURRENCE_END_TIME'), width: "240px", template: function (dataItem) {
                                    if (dataItem.end) {
                                        return moment(kendo.parseDate(dataItem.end)).format('L LT');
                                    }
                                    else {
                                        return '';
                                    }
                                }
                            },
                            {
                                field: "startedAt", title: $translate.instant('COMMON_TRAINING_STARTED'), width: "200px", template: function (dataItem) {
                                    if (dataItem.startedAt) {
                                        return moment(kendo.parseDate(dataItem.startedAt)).format('L LT');
                                    }
                                    else {
                                        return '';
                                    }
                                }
                            },
                            {
                                field: "feedbackDateTime", title: $translate.instant('COMMON_TRAINING_ENDED'), width: "200px", template: function (dataItem) {
                                    if (dataItem.feedbackDateTime) {
                                        return moment(kendo.parseDate(dataItem.feedbackDateTime)).format('L LT');
                                    }
                                    else {
                                        return '';
                                    }
                                }
                            },
                            { field: "workedWell", title: $translate.instant('COMMON_WORKED_WELL'), width: "200px" },
                            { field: "workedNotWell", title: $translate.instant('COMMON_WORKED_NOT_WELL'), width: "240px" },
                            { field: "whatNextDescription", title: $translate.instant('COMMON_WHAT_NEXT'), width: "200px" },
                            {
                                field: "rating", title: $translate.instant('COMMON_RATING'), template: function (data) {
                                    var template = "";
                                    for (var i = 0; i < data.rating; i++) {
                                        template += "<span><label class='fa fa-star fa-fw selected'></label></span>";
                                    }
                                    return template;
                                }
                            },
                            { field: "timeSpentMinutes", title: $translate.instant('COMMON_TIME_SPENT'), width: "150px" },
                            { field: "id", title: $translate.instant('COMMON_ACTION'), width: "100px", template: "<a href='javascript:;' class='fa fa-pencil' title='edit' ng-click='editEvaluationFeedback(#:id#)'></a> <a href='javascript:;' class='fa fa-eye' title='view' ng-click='viewEvaluationFeedback(#:id#)'> </a>", filterable: false, sortable: false, }
                        ],
                    });
                    $("#userStatsEvaluationFeedbackGrid").kendoTooltip({
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
                    $compile($("#userStatsEvaluationFeedbackGrid"))($scope);
                }
            }
            $scope.editEvaluationFeedback = function (id) {
                if (id > 0) {
                    $scope.evaluationFeedbackViewOnly = false;
                    $scope.evaluationFeedback = _.find($scope.allFeedbacks, function (feedbackItem) {
                        return feedbackItem.id == id;
                    });
                    if ($scope.evaluationFeedback) {
                        $("#tdFeedbackModal").modal("show");
                    }
                }
            }
            $scope.viewEvaluationFeedback = function (id) {
                if (id > 0) {
                    $scope.evaluationFeedbackViewOnly = true;
                    $scope.evaluationFeedback = _.find($scope.allFeedbacks, function (feedbackItem) {
                        return feedbackItem.id == id;
                    });
                    if ($scope.evaluationFeedback) {
                        $("#tdFeedbackModal").modal("show");
                    }
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
                        $scope.updateSpentTimeCalculation();
                        $("#tdFeedbackModal").modal("hide");
                    }
                    else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_FEEDBACK_NOT_SAVED'), "warning");
                    }
                });
            }
            $scope.updateSpentTimeCalculation = function () {
                $scope.isTimeCalculated = false;
                trainingsDiaryService.getUserTrainingsForTimeCalculation($scope.currentUser.user.id).then(function (data) {
                    $scope.trainingTimes = [];
                    $scope.filteredTrainings = [{ id: null, name: "All" }];
                    $scope.totalProfileTrainingSpentHoursToday = 0;
                    $scope.totalProfileTrainingSpentHoursWeek = 0;
                    $scope.totalProfileTrainingSpentHours = 0;
                    $scope.trainingProfileHoursToday = 0;
                    $scope.trainingProfileHoursWeek = 0;
                    $scope.totalProfileTrainingHours = 0;
                    $scope.totalProfileTrainingTodayResult = 0;
                    $scope.totalProfileTrainingWeekResult = 0;
                    $scope.totalProfileTrainingResult = 0;
                    var startDates = [];
                    var endDates = [];
                    _.forEach(data, function (trainingItem) {
                        //Calcuate Time
                        if (trainingItem.id > 0) {
                            var isAllow = false;

                            if ($scope.filterType == $translate.instant('TRAININGDAIRY_ALL_AGREEGATE')) {
                                isAllow = true;
                            }
                            
                            if (isAllow) {
                                $scope.filteredTrainings.push({
                                    id: trainingItem.id,
                                    name: trainingItem.name
                                });
                            }
                            if ($scope.selectedFilteredTrainingId > 0) {
                                if (trainingItem.id == $scope.selectedFilteredTrainingId) {
                                    isAllow = true;
                                }
                                else {
                                    isAllow = false;
                                }
                            }

                            if (isAllow) {
                                var event = new kendo.data.SchedulerEvent({
                                    id: trainingItem.id,
                                    description: trainingItem.additionalInfo,
                                    title: trainingItem.name,
                                    start: kendo.parseDate(trainingItem.startDate), //item1.start,
                                    isAllDay: moment(kendo.parseDate(trainingItem.startDate)).format("HHmmss") == "000000",
                                    end: kendo.parseDate(trainingItem.endDate),
                                    recurrenceRule: trainingItem.frequency,
                                    eventType: eventTypeEnum.ProfileTraining,
                                });
                                $scope.trainingTimes.push({ id: trainingItem.id, totalTime: 0, spentTime: 0 })

                                _.each(trainingItem.trainingFeedbacks, function (itemfeedback) {
                                    if (itemfeedback.evaluatorId == null) {
                                        var isTrainingFinished = true;
                                        if (itemfeedback.isParticipantPaused == true) {
                                            var finishedTraining = _.filter(trainingItem.trainingFeedbacks, function (feedbackItem) {
                                                return itemfeedback.recurrencesStartTime == feedbackItem.recurrencesStartTime && itemfeedback.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                            });
                                            if (finishedTraining.length > 0) {
                                                isTrainingFinished = true
                                            }
                                            else {
                                                isTrainingFinished = false;
                                            }
                                        }
                                        if (!(itemfeedback.isParticipantPaused == true && isTrainingFinished == true)) {
                                            if (trainingItem.userId == null) {
                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].spentTime += itemfeedback.timeSpentMinutes;
                                                if (itemfeedback.recurrencesStartTime) {
                                                    if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.dayStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.dayEndDate) {
                                                        $scope.totalProfileTrainingSpentHoursToday += (itemfeedback.timeSpentMinutes);
                                                    }
                                                    if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.weekStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.weekEndDate) {
                                                        $scope.totalProfileTrainingSpentHoursWeek += itemfeedback.timeSpentMinutes;
                                                    }
                                                }
                                                $scope.totalProfileTrainingSpentHours += itemfeedback.timeSpentMinutes;
                                            }
                                            
                                        }
                                    }
                                });
                                var occurrences = event.expand(kendo.parseDate(trainingItem.startDate), kendo.parseDate(trainingItem.endDate));
                                angular.forEach(occurrences, function (item1, index1) {
                                    if (trainingItem.durationMetricId == 1) {
                                        //Hour
                                        $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration * 60);
                                        if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                            if (trainingItem.userId == null) {
                                                $scope.trainingProfileHoursToday += (trainingItem.duration * 60);
                                            }
                                           
                                        }
                                        if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                            if (trainingItem.userId == null) {
                                                $scope.trainingProfileHoursWeek += (trainingItem.duration * 60);
                                            }
                                           
                                        }
                                        if (trainingItem.userId == null) {
                                            $scope.totalProfileTrainingHours += (trainingItem.duration * 60);
                                        }
                                        
                                    }
                                    if (trainingItem.durationMetricId == 3) {
                                        //Minutes
                                        $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration);
                                        if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                            if (trainingItem.userId == null) {
                                                $scope.trainingProfileHoursToday += (trainingItem.duration);
                                            }
                                            
                                        }
                                        if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                            if (trainingItem.userId == null) {
                                                $scope.trainingProfileHoursWeek += (trainingItem.duration);
                                            }
                                            
                                        }
                                        if (trainingItem.userId == null) {
                                            $scope.totalProfileTrainingHours += (trainingItem.duration);
                                        }
                                       
                                    }
                                    if (trainingItem.durationMetricId == 4) {
                                        //Seconds
                                        $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration / 60);
                                        if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                            if (trainingItem.userId == null) {
                                                $scope.trainingProfileHoursToday += (trainingItem.duration / 60);
                                            }
                                            
                                        }
                                        if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                            if (trainingItem.userId == null) {
                                                $scope.trainingProfileHoursWeek += (trainingItem.duration / 60);
                                            }
                                            
                                        }
                                        if (trainingItem.userId == null) {
                                            $scope.totalProfileTrainingHours += (trainingItem.duration / 60);
                                        }
                                       
                                    }
                                    if (trainingItem.durationMetricId == 5) {
                                        //Days
                                        $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration * 1440);
                                        if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                            if (trainingItem.userId == null) {
                                                $scope.trainingProfileHoursToday += (trainingItem.duration * 1440);
                                            }
                                            
                                        }
                                        if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                            if (trainingItem.userId == null) {
                                                $scope.trainingProfileHoursWeek += (trainingItem.duration * 1440);
                                            }
                                            
                                        }
                                        if (trainingItem.userId == null) {
                                            $scope.totalProfileTrainingHours += (trainingItem.duration * 1440);
                                        }
                                       
                                    }
                                    startDates.push(item1.start)
                                });
                            }
                        }
                    })
                    var sortedStartDate = _.sortBy(startDates, function (dateItem) {
                        return -(kendo.parseDate(dateItem).getTime());
                    });
                    $scope.trainingStartDate = sortedStartDate[sortedStartDate.length - 1];
                    $scope.trainingEndDate = sortedStartDate[0];
                    $scope.isTimeCalculated = true;
                    $scope.totalProfileTrainingTodayResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHoursToday, $scope.trainingProfileHoursToday)
                    $scope.totalProfileTrainingWeekResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHoursWeek, $scope.trainingProfileHoursWeek)
                    $scope.totalProfileTrainingResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHours, $scope.totalProfileTrainingHours)
                });
            }
            $scope.selectedProfileTimeCalculation = function () {
                $scope.isTimeCalculated = false;
                $scope.trainingTimes = [];
                $scope.filteredTrainings = [{ id: null, name: "All" }];
                $scope.totalProfileTrainingSpentHoursToday = 0;
                $scope.totalProfileTrainingSpentHoursWeek = 0;
                $scope.totalProfileTrainingSpentHours = 0;
                $scope.trainingProfileHoursToday = 0;
                $scope.trainingProfileHoursWeek = 0;
                $scope.totalProfileTrainingHours = 0;
                $scope.totalProfileTrainingTodayResult = 0;
                $scope.totalProfileTrainingWeekResult = 0;
                $scope.totalProfileTrainingResult = 0;
                var startDates = [];
                var endDates = [];
                var userId = $scope.activeProfile.profile.participantUserId > 0 ? $scope.activeProfile.profile.participantUserId : $scope.currentUser.user.id;
                trainingdiaryManager.getUserProfileStageTrainings(userId, $scope.activeProfile.profile.id).then(function (data) {
                    if (data.length > 0) {
                        var activeProfile = data[0];
                        if (activeProfile.ipsTrainingDiaryStages) {
                            _.forEach(activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                                if (stageItem.evaluationAgreement) {
                                    _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                        if (evaluationAgreementItem.trainings) {
                                            _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                if (trainingItem.id > 0) {

                                                    $scope.filteredTrainings.push({
                                                        id: trainingItem.id,
                                                        name: trainingItem.name
                                                    });
                                                    var isAllow = true;
                                                    if ($scope.selectedFilteredTrainingId > 0) {
                                                        if (trainingItem.id == $scope.selectedFilteredTrainingId) {
                                                            isAllow = true;
                                                        }
                                                        else {
                                                            isAllow = false;
                                                        }
                                                    }

                                                    if (isAllow) {
                                                        var event = new kendo.data.SchedulerEvent({
                                                            id: trainingItem.id,
                                                            description: trainingItem.additionalInfo,
                                                            title: trainingItem.name,
                                                            start: kendo.parseDate(trainingItem.startDate), //item1.start,
                                                            isAllDay: moment(kendo.parseDate(trainingItem.startDate)).format("HHmmss") == "000000",
                                                            end: kendo.parseDate(trainingItem.endDate),
                                                            recurrenceRule: trainingItem.frequency,
                                                            eventType: eventTypeEnum.ProfileTraining,
                                                        });
                                                        $scope.trainingTimes.push({ id: trainingItem.id, totalTime: 0, spentTime: 0 });
                                                        _.each(trainingItem.trainingFeedbacks, function (itemfeedback) {
                                                            if (itemfeedback.evaluatorId == null) {
                                                                var isTrainingFinished = true;
                                                                if (itemfeedback.isParticipantPaused == true) {
                                                                    var finishedTraining = _.filter(trainingItem.trainingFeedbacks, function (feedbackItem) {
                                                                        return itemfeedback.recurrencesStartTime == feedbackItem.recurrencesStartTime && itemfeedback.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                                                    });
                                                                    if (finishedTraining.length > 0) {
                                                                        isTrainingFinished = true
                                                                    }
                                                                    else {
                                                                        isTrainingFinished = false;
                                                                    }
                                                                }
                                                                if (!(itemfeedback.isParticipantPaused == true && isTrainingFinished == true)) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingTimes[$scope.trainingTimes.length - 1].spentTime += itemfeedback.timeSpentMinutes;
                                                                        if (itemfeedback.recurrencesStartTime) {
                                                                            if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.dayStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.dayEndDate) {
                                                                                $scope.totalProfileTrainingSpentHoursToday += (itemfeedback.timeSpentMinutes);
                                                                            }
                                                                            if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.weekStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.weekEndDate) {
                                                                                $scope.totalProfileTrainingSpentHoursWeek += itemfeedback.timeSpentMinutes;
                                                                            }
                                                                        }
                                                                        $scope.totalProfileTrainingSpentHours += itemfeedback.timeSpentMinutes;
                                                                    }
                                                                    
                                                                }
                                                            }
                                                        });
                                                        var occurrences = event.expand(kendo.parseDate(trainingItem.startDate), kendo.parseDate(trainingItem.endDate));
                                                        angular.forEach(occurrences, function (item1, index1) {
                                                            if (trainingItem.durationMetricId == 1) {
                                                                //Hour
                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration * 60);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration * 60);
                                                                    }
                                                                  
                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration * 60);
                                                                    }
                                                                    
                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.totalProfileTrainingHours += (trainingItem.duration * 60);
                                                                }
                                                                
                                                            }
                                                            if (trainingItem.durationMetricId == 3) {
                                                                //Minutes
                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration);
                                                                    }
                                                                    
                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration);
                                                                    }
                                                                    
                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.totalProfileTrainingHours += (trainingItem.duration);
                                                                }
                                                                
                                                            }
                                                            if (trainingItem.durationMetricId == 4) {
                                                                //Seconds
                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration / 60);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration / 60);
                                                                    }
                                                                    
                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration / 60);
                                                                    }
                                                                    
                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.totalProfileTrainingHours += (trainingItem.duration / 60);
                                                                }
                                                                
                                                            }
                                                            if (trainingItem.durationMetricId == 5) {
                                                                //Days
                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration * 1440);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration * 1440);
                                                                    }
                                                                    
                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration * 1440);
                                                                    }
                                                                    
                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.totalProfileTrainingHours += (trainingItem.duration * 1440);
                                                                }
                                                                
                                                            }
                                                            startDates.push(item1.start)
                                                        });
                                                        var sortedStartDate = _.sortBy(startDates, function (dateItem) {
                                                            return -(kendo.parseDate(dateItem).getTime());
                                                        });
                                                        $scope.trainingStartDate = sortedStartDate[sortedStartDate.length - 1];
                                                        $scope.trainingEndDate = sortedStartDate[0];
                                                        $scope.isTimeCalculated = true;
                                                        $scope.totalProfileTrainingTodayResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHoursToday, $scope.trainingProfileHoursToday)
                                                        $scope.totalProfileTrainingWeekResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHoursWeek, $scope.trainingProfileHoursWeek)
                                                        $scope.totalProfileTrainingResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHours, $scope.totalProfileTrainingHours)
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        $scope.isTimeCalculated = true;
                    }
                    else {
                    }
                }, function (e) {
                    dialogService.showNotification($translate.instant('TRAININGDAIRY_THERE_IS_SOMETHING_WENT_WRONG'), "error");
                });
            }
            $scope.selectFilteredTraining = function (id) {
                $scope.selectedFilteredTrainingId = id;
                $scope.selectedFilteredTraining = _.find($scope.filteredTrainings, function (item) {
                    return item.id == id;
                });
                $scope.changeFilterTrainingType($scope.filterType);
            }
            $scope.TabChange = function (viewName) {
                if ($("#js-grid-juicy-projects").hasClass("cbp-caption-active")) {
                    $("#js-grid-juicy-projects").cubeportfolio('destroy');
                }
                if (viewName == "KPIs") {
                    App.initSlimScroll(".scroller");
                }
                if (viewName == "calender") {
                    var particpants = [];
                    var inviteParticipants = [];
                    _.forEach($scope.participnats, function (item) {
                        var participant = { value: item.id, text: item.firstName };
                        particpants.push(participant);
                        inviteParticipants.push(participant);
                    })
                    //For Task 
                    var taskCategoryList = [];
                    _.forEach(taskCategories, function (item) {
                        var Category = { value: item.id, text: item.name };
                        taskCategoryList.push(Category);
                    })
                    var taskStatusesList = [];
                    _.forEach(taskStatuses, function (item) {
                        var status = { value: item.id, text: item.name };
                        taskStatusesList.push(status);
                    });
                    var taskPrioritiesList = [];
                    _.forEach(taskPriorities, function (item) {
                        var Priority = { value: item.id, text: item.name };
                        taskPrioritiesList.push(Priority);
                    });
                    // Profile Trainings
                    $scope.profileTrainings = [];
                    if ($scope.activeProfile) {
                        _.forEach($scope.activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                            if (stageItem.evaluationAgreement) {
                                _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                    if (evaluationAgreementItem.trainings) {
                                        _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                            trainingItem["isParticipant"] = $scope.activeProfile.profile.participants.length > 0 ? true : false;
                                            if (trainingItem.isParticipant) {
                                                trainingItem["participantName"] = $scope.activeProfile.profile.participants[0].firstName + " " + $scope.activeProfile.profile.participants[0].lastName;
                                            }
                                            else {
                                                trainingItem["participantName"] = "";
                                            }
                                            trainingItem["isEvaluator"] = $scope.activeProfile.profile.evaluators.length > 0 ? true : false;
                                            if (trainingItem.isEvaluator) {
                                                trainingItem["evaluatorName"] = $scope.activeProfile.profile.evaluators[0].firstName + " " + $scope.activeProfile.profile.evaluators[0].lastName;
                                            }
                                            else {
                                                trainingItem["evaluatorName"] = "";
                                            }
                                            $scope.profileTrainings.push(trainingItem);
                                        });
                                    }
                                });
                            }
                        });
                    }
                    if ($("#tdcalendar").data("kendoScheduler")) {
                        $("#tdcalendar").data("kendoScheduler").destroy();
                        $("#tdcalendar").html("");
                    }
                    var calenderStartTime = kendo.parseDate("2018-01-01T00:00:00.000");
                    if ($scope.isPassedTrainingView) {
                        calenderStartTime = kendo.parseDate(moment($scope.profileStartDate).format('L LT'))
                    }
                    $("#tdcalendar").kendoScheduler({
                        date: moment().toDate(),
                        height: 600,
                        views: [
                            { type: "day", title: $translate.instant('COMMON_DAY') },
                            { type: "week", title: $translate.instant('COMMON_WEEK') },
                            { type: "month", title: $translate.instant('COMMON_MONTH'), selected: true },
                            { type: "agenda", title: $translate.instant('COMMON_AGENDA') }
                        ],
                        edit: function (e) {
                            var participantDropDown = $("select[data-bind='value:userId']").getKendoDropDownList();
                            participantDropDown.bind('change', taskParticipantChanged);
                            var inviteDropDown = $("select[data-bind='value:participantId']").getKendoDropDownList();
                            inviteDropDown.bind('change', inviteDropDownChanged);
                            if (e.event.id != 0) {
                                participantDropDown.enable(false)
                                inviteDropDown.enable(false)
                                $("input[data-bind='value:title']").attr("disabled", true);
                                $("textarea[data-bind='value:description']").attr("disabled", true);
                                $("[data-bind='checked:isAllDay']").attr("disabled", true);
                                $("[data-bind='value:start,invisible:isAllDay']").data("kendoDateTimePicker").enable(false);
                                $("[data-bind='value:end,invisible:isAllDay']").data("kendoDateTimePicker").enable(false);
                                var eventTypeDropDown = $("div[data-container-for='eventType'] select").getKendoDropDownList();
                                eventTypeDropDown.enable(false)
                                var categoryDropDown = $("div[data-container-for='categoryId'] select").getKendoDropDownList();
                                categoryDropDown.enable(false)
                                var priorityDropDown = $("div[data-container-for='priorityId'] select").getKendoDropDownList();
                                priorityDropDown.enable(false)
                                var recurrenceEditor = $("div[data-bind='value:recurrenceRule']");
                                recurrenceEditor.hide();
                            }
                        },
                        editable: true,
                        navigate: scheduler_navigate,
                        eventTemplate: $("#event-template").html(),
                        resources: [
                            {
                                title: $translate.instant('COMMON_PARTICIPANT'),
                                field: "userId",
                                dataSource: particpants,
                            },
                            {
                                title: $translate.instant('TRAININGDAIRY_INVITE'),
                                field: "participantId",
                                dataSource: inviteParticipants,
                            },
                            {
                                title: $translate.instant('COMMON_EVENT_TYPE'),
                                field: "eventType",
                                dataSource: [{ value: 1, text: "Task" }, { value: 2, text: "Training" }, { value: 3, text: "Training" }]
                            },
                            {
                                title: $translate.instant('COMMON_CATEGORY'),
                                field: "categoryId",
                                dataSource: taskCategoryList,
                            },
                            {
                                title: $translate.instant('COMMON_STATUS'),
                                field: "statusId",
                                dataSource: taskStatusesList
                            },
                            {
                                title: $translate.instant('COMMON_PRIORITY'),
                                field: "priorityId",
                                dataSource: taskPrioritiesList
                            },
                        ],
                        dataSource: {
                            batch: false,
                            transport: {
                                read: function (options) {
                                    var ds = new kendo.data.ObservableArray([]);
                                    var ipsCalenderEventFilterModel = {
                                        userId: $scope.currentUser.user.id,
                                        startDate: null,
                                        endDate: null
                                    };
                                    if ($scope.isPassedTrainingView) {
                                        ipsCalenderEventFilterModel.startDate = moment(kendo.parseDate($scope.profileStartDate)).format('L LT');
                                        ipsCalenderEventFilterModel.endDate = moment(kendo.parseDate($scope.profileEndDate)).format('L LT');
                                    }
                                    trainingsDiaryService.getEventsByUserId(ipsCalenderEventFilterModel).then(function (data) {
                                        angular.forEach(data, function (item, index) {
                                            var event = new kendo.data.SchedulerEvent({
                                                id: item.id,
                                                description: item.description,
                                                title: item.title,
                                                start: kendo.parseDate(item.start), //item1.start,
                                                end: kendo.parseDate(item.end),
                                                recurrenceRule: item.recurrenceRule,
                                                eventType: item.eventType,
                                                isAllDay: moment(kendo.parseDate(item.start)).format("HHmmss") == "000000",
                                                color: item.eventType == eventTypeEnum.Task ? "#F6B94D" : "#C94D09",
                                                taskListId: taskList ? taskList.id : 0,
                                                statusId: item.statusId,
                                                categoryId: item.categoryId,
                                                priorityId: item.priorityId
                                            });
                                            var occurrences = event.expand(kendo.parseDate(item.start), kendo.parseDate(item.end));
                                            angular.forEach(occurrences, function (item1, index1) {
                                                var endTime = moment(kendo.parseDate(item1.start)).endOf("day")._d;
                                                if (!(occurrences[index1 + 1])) {
                                                    if (endTime.getTime() > kendo.parseDate(item.end).getTime()) {
                                                        endTime = moment(item.end)._d;
                                                    }
                                                    if (item1.start.getTime() != endTime.getTime()) {
                                                        var eventItem = new kendo.data.SchedulerEvent({
                                                            orginalId: item.id,
                                                            id: item1.id == 0 ? item1.recurrenceId : item1.id,
                                                            description: item1.description,
                                                            title: item1.title,
                                                            start: item1.start, //"/Date(1523511510858)/", //item1.start,
                                                            end: endTime, //"/Date(1523511510858)/"
                                                            isAllDay: false,
                                                            eventType: item1.eventType,
                                                            color: item.eventType == eventTypeEnum.Task ? "#F6B94D" : "#C94D09",
                                                            taskListId: taskList ? taskList.id : 0,
                                                            statusId: item.statusId,
                                                            categoryId: item.categoryId,
                                                            priorityId: item.priorityId,
                                                            durationMetric: item.durationMetricId
                                                        });
                                                        ds.push(eventItem);
                                                    }
                                                }
                                                else {
                                                    var eventItem = new kendo.data.SchedulerEvent({
                                                        orginalId: item.id,
                                                        id: item1.id == 0 ? item1.recurrenceId : item1.id,
                                                        description: item1.description,
                                                        title: item1.title,
                                                        start: item1.start, //"/Date(1523511510858)/", //item1.start,
                                                        end: endTime, //"/Date(1523511510858)/"
                                                        isAllDay: false,
                                                        eventType: item1.eventType,
                                                        color: item.eventType == eventTypeEnum.Task ? "#F6B94D" : "#C94D09",
                                                        taskListId: taskList ? taskList.id : 0,
                                                        statusId: item.statusId,
                                                        categoryId: item.categoryId,
                                                        priorityId: item.priorityId,
                                                        durationMetric: item.durationMetricId
                                                    });
                                                    ds.push(eventItem);
                                                }
                                            });
                                        });
                                        angular.forEach($scope.profileTrainings, function (item, index) {
                                            var event = new kendo.data.SchedulerEvent({
                                                id: item.id,
                                                description: item.additionalInfo,
                                                title: item.name,
                                                start: kendo.parseDate(item.startDate), //item1.start,
                                                end: kendo.parseDate(item.endDate),
                                                recurrenceRule: item.frequency,
                                                eventType: 3,
                                                isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                                color: "#6CE26C",
                                                taskListId: -1,
                                                statusId: -1,
                                                categoryId: -1,
                                                priorityId: -1,
                                                isParticipant: item.isParticipant,
                                                participantName: item.participantName,
                                                isEvaluator: item.isEvaluator,
                                                evaluatorName: item.evaluatorName,
                                                skillId: item.skillId
                                            });
                                            var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.endDate));
                                            angular.forEach(occurrences, function (item1, index1) {
                                                var endTime = moment(kendo.parseDate(item1.start)).endOf("day")._d;
                                                if (!(occurrences[index1 + 1])) {
                                                    if (endTime.getTime() > kendo.parseDate(item.endDate).getTime()) {
                                                        endTime = kendo.parseDate(item.endDate);
                                                    }
                                                    if (item1.start.getTime() != endTime.getTime()) {
                                                        var eventItem = new kendo.data.SchedulerEvent({
                                                            orginalId: item.id,
                                                            id: item1.id == 0 ? item1.recurrenceId : item1.id,
                                                            description: item1.description,
                                                            title: item1.title,
                                                            start: kendo.parseDate(moment(item1.start).format('L LT')), //"/Date(1523511510858)/", //item1.start,
                                                            end: endTime, //"/Date(1523511510858)/"
                                                            isAllDay: false,
                                                            eventType: 3,
                                                            color: "#6CE26C",
                                                            taskListId: -1,
                                                            statusId: -1,
                                                            categoryId: -1,
                                                            priorityId: -1,
                                                            skillId: item.skillId,
                                                            isParticipant: item.isParticipant,
                                                            participantName: item.participantName,
                                                            isEvaluator: item.isEvaluator,
                                                            evaluatorName: item.evaluatorName,
                                                            durationMetric: item.durationMetricId
                                                        });
                                                        ds.push(eventItem);
                                                    }
                                                }
                                                else {
                                                    var eventItem = new kendo.data.SchedulerEvent({
                                                        orginalId: item.id,
                                                        id: item1.id == 0 ? item1.recurrenceId : item1.id,
                                                        description: item1.description,
                                                        title: item1.title,
                                                        start: kendo.parseDate(item1.start), //"/Date(1523511510858)/", //item1.start,
                                                        end: endTime, //"/Date(1523511510858)/"
                                                        isAllDay: false,
                                                        eventType: 3,
                                                        color: "#6CE26C",
                                                        taskListId: -1,
                                                        statusId: -1,
                                                        categoryId: -1,
                                                        priorityId: -1,
                                                        skillId: item.skillId,
                                                        isParticipant: item.isParticipant,
                                                        participantName: item.participantName,
                                                        isEvaluator: item.isEvaluator,
                                                        evaluatorName: item.evaluatorName,
                                                        durationMetric: item.durationMetricId
                                                    });
                                                    ds.push(eventItem);
                                                }
                                            });
                                        });
                                        var todos = [];
                                        angular.forEach(ds, function (item, index) {
                                            todos.push(item);
                                        });
                                        options.success(todos);
                                    });
                                },
                                update: function (option) {
                                    option.data.categoryId = $("div[data-container-for='categoryId'] select").val();
                                    option.data.statusId = $("div[data-container-for='statusId'] select").val()
                                    option.data.priorityId = $("div[data-container-for='priorityId'] select").val();
                                    trainingsDiaryService.setEventsByUserId(option.data).then(function (data) {
                                        if (data > 0) {
                                            option.success(data);
                                        }
                                        else {
                                            option.error(obj);
                                        }
                                    });
                                },
                                create: function (option) {
                                    if (!(option.data.userId > 0)) {
                                        option.data.userId = $scope.currentUser.user.id;
                                    }
                                    if (!(option.data.eventType > 0)) {
                                        option.data.eventType = 1;
                                    }
                                    var obj = option.data;
                                    obj.userId = $("div[data-container-for='userId'] select").val();
                                    obj.participantId = $("div[data-container-for='participantId'] select").val();
                                    obj.eventType = $("div[data-container-for='eventType'] select").val();
                                    obj.categoryId = $("div[data-container-for='categoryId'] select").val();
                                    obj.statusId = $("div[data-container-for='statusId'] select").val()
                                    obj.priorityId = $("div[data-container-for='priorityId'] select").val()
                                    trainingsDiaryService.setEventsByUserId(obj).then(function (data) {
                                        if (data > 0) {
                                            obj.id = data;
                                            option.success(obj);
                                        }
                                        else if (data == -1) {
                                            option.success(obj);
                                        } else {
                                            option.error(obj);
                                        }
                                    });
                                },
                                parameterMap: function (options, operation) {
                                    if (operation !== "read" && options.models) {
                                        return { models: kendo.stringify(options.models) };
                                    }
                                }
                            },
                            schema: {
                                model: {
                                    "id": "id",
                                    "fields": {
                                        "eventType": {
                                            "from": "eventType",
                                            "type": "number",
                                            "defaultValue": 1,
                                        },
                                        "id": {
                                            "type": "number"
                                        },
                                        "orginalId": {
                                            "type": "number"
                                        },
                                        "title": {
                                            "from": "title"
                                        },
                                        "start": {
                                            "from": "start",
                                            "type": "date"
                                        },
                                        "end": {
                                            "from": "end",
                                            "type": "date"
                                        },
                                        "isAllDay": {
                                            "type": "boolean"
                                        },
                                        "participantId": {
                                            "from": "participantId",
                                            "type": "number",
                                            "defaultValue": 0,
                                        },
                                        "userId": {
                                            "from": "userId",
                                            "type": "number",
                                            "defaultValue": $scope.currentUser.user.id,
                                        },
                                        "recurrenceRule": {
                                            "type": "string"
                                        },
                                        "color": {
                                            "type": "string"
                                        },
                                        "categoryId": {
                                            "from": "categoryId",
                                            "type": "number",
                                            "defaultValue": 0,
                                        },
                                        "statusId": {
                                            "from": "statusId",
                                            "type": "number",
                                            "defaultValue": 0,
                                        },
                                        "priorityId": {
                                            "from": "priorityId",
                                            "type": "number",
                                            "defaultValue": 0,
                                        },
                                        "taskListId": {
                                            "type": "number",
                                            "defaultValue": taskList ? taskList.id : 0,
                                        }
                                    }
                                }
                            }
                        },
                    });
                }
                if (viewName == "video") {
                    if ($("#js-grid-juicy-projects").hasClass("cbp-caption-active")) {
                        $("#js-grid-juicy-projects").cubeportfolio('destroy');
                    }
                    if ($scope.profileTrainingMaterials) {
                        if ($scope.profileTrainingMaterials.length > 0) {
                            $("#js-grid-juicy-projects").cubeportfolio({
                                filters: "#js-filters-juicy-projects",
                                layoutMode: "grid",
                                defaultFilter: "*",
                                animationType: "quicksand",
                                gapHorizontal: 35,
                                gapVertical: 30,
                                gridAdjustment: "responsive",
                                mediaQueries: [{
                                    width: 1500,
                                    cols: 5
                                }, {
                                    width: 1100,
                                    cols: 4
                                }, {
                                    width: 800,
                                    cols: 3
                                }, {
                                    width: 480,
                                    cols: 2
                                }, {
                                    width: 320,
                                    cols: 1
                                }],
                                caption: "overlayBottomReveal",
                                displayType: "sequentially",
                                displayTypeSpeed: 80,
                                singlePageCallback: function (i, t) {
                                    var l = this;
                                    if ($(t).data("link")) {
                                        i = $(t).data("link");
                                    }
                                    i = decodeURIComponent(i);
                                    if (i.indexOf("youtube") > -1) {
                                        var v = getParameterByName(i, 'v');
                                        i = "https://www.youtube.com/embed/" + v;
                                    }
                                    var IsInsecureLink = false;
                                    if (i.indexOf("https") == -1) {
                                        IsInsecureLink = true;
                                    }
                                    $scope.materialInfo = _.find($scope.profileTrainingMaterials, function (info) {
                                        return t.id == info.id;
                                    });
                                    $scope.trainingInfo = null;
                                    _.forEach($scope.activeProfile.ipsTrainingDiaryStages, function (ipsTrainingDiaryStage) {
                                        _.forEach(ipsTrainingDiaryStage.evaluationAgreement, function (evaluationAgreement) {
                                            $scope.activeKPIType = evaluationAgreement.kpiType;
                                            _.forEach(evaluationAgreement.trainings, function (training) {
                                                if (training.id == $scope.materialInfo.trainingId) {
                                                    $scope.trainingInfo = training;
                                                    return (false);
                                                }
                                            })
                                        })
                                    });
                                    if ($scope.materialInfo) {
                                        $scope.materialInfo.link = i;
                                        $scope.materialInfo.IsInsecureLink = IsInsecureLink;
                                        var compiledeHTML = $compile("<material-popup material-info='materialInfo' training-info='trainingInfo' ></material-popup>")($scope);
                                        l.updateSinglePage(compiledeHTML);
                                    }
                                    else {
                                        l.updateSinglePage("<div>There is something wrong!!</div>");
                                    }
                                }
                            })
                        }
                    }
                }
                if (viewName == "diary") {
                    if (!($scope.currentUser)) {
                        var authData = localStorageService.get('authorizationData');
                        $scope.currentUser = authData;
                        $scope.currentUser.user["userKey"] = authData.user.id;
                        $scope.currentUser.user.id = authData.user.userId;
                        $scope.filter.participantId = ($scope.currentUser.user.userKey);
                        $scope.filter.organizationId = parseInt($scope.currentUser.user.organizationId);
                        organizationChanged($scope.filter.organizationId);
                    }
                    $scope.isTimeCalculated = false
                    $scope.calculatedAt = new Date();
                    if ($scope.filterType == "Selected Profile") {
                        $scope.selectedProfileTimeCalculation();
                    }
                    else {
                        trainingsDiaryService.getUserTrainingsForTimeCalculation($scope.currentUser.user.id).then(function (data) {
                            $scope.trainingTimes = [];
                            $scope.totalProfileTrainingSpentHoursToday = 0;
                            $scope.totalProfileTrainingSpentHoursWeek = 0;
                            $scope.totalProfileTrainingSpentHours = 0;
                            $scope.trainingProfileHoursToday = 0;
                            $scope.trainingProfileHoursWeek = 0;
                            $scope.totalProfileTrainingHours = 0;
                            $scope.totalProfileTrainingTodayResult = 0;
                            $scope.totalProfileTrainingWeekResult = 0;
                            $scope.totalProfileTrainingResult = 0;
                            var startDates = [];
                            var endDates = [];
                            _.forEach(data, function (trainingItem) {
                                //Calcuate Time
                                if (trainingItem.id > 0) {
                                    var isAllow = false;
                                    if ($scope.filterType == $translate.instant('TRAININGDAIRY_ALL_AGREEGATE')) {
                                        isAllow = true;
                                    }
                                    else {
                                        isAllow = true;
                                    }
                                    if (isAllow) {
                                        var event = new kendo.data.SchedulerEvent({
                                            id: trainingItem.id,
                                            description: trainingItem.additionalInfo,
                                            title: trainingItem.name,
                                            start: kendo.parseDate(trainingItem.startDate), //item1.start,
                                            isAllDay: moment(kendo.parseDate(trainingItem.startDate)).format("HHmmss") == "000000",
                                            end: kendo.parseDate(trainingItem.endDate),
                                            recurrenceRule: trainingItem.frequency,
                                            eventType: eventTypeEnum.ProfileTraining,
                                        });
                                        $scope.trainingTimes.push({ id: trainingItem.id, totalTime: 0, spentTime: 0 });
                                        _.each(trainingItem.trainingFeedbacks, function (itemfeedback) {
                                            if (itemfeedback.evaluatorId == null) {
                                                var isTrainingFinished = true;
                                                if (itemfeedback.isParticipantPaused == true) {
                                                    var finishedTraining = _.filter(trainingItem.trainingFeedbacks, function (feedbackItem) {
                                                        return itemfeedback.recurrencesStartTime == feedbackItem.recurrencesStartTime && itemfeedback.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                                    });
                                                    if (finishedTraining.length > 0) {
                                                        isTrainingFinished = true
                                                    }
                                                    else {
                                                        isTrainingFinished = false;
                                                    }
                                                }
                                                if (!(itemfeedback.isParticipantPaused == true && isTrainingFinished == true)) {
                                                    if (trainingItem.userId == null) {
                                                        $scope.trainingTimes[$scope.trainingTimes.length - 1].spentTime += itemfeedback.timeSpentMinutes;
                                                        if (itemfeedback.recurrencesStartTime) {
                                                            if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.dayStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.dayEndDate) {
                                                                $scope.totalProfileTrainingSpentHoursToday += (itemfeedback.timeSpentMinutes);
                                                            }
                                                            if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.weekStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.weekEndDate) {
                                                                $scope.totalProfileTrainingSpentHoursWeek += itemfeedback.timeSpentMinutes;
                                                            }
                                                        }
                                                        $scope.totalProfileTrainingSpentHours += itemfeedback.timeSpentMinutes;
                                                    }
                                                    
                                                }
                                            }
                                        });
                                        if (trainingItem.startDate && trainingItem.endDate) {
                                            var occurrences = event.expand(kendo.parseDate(trainingItem.startDate), kendo.parseDate(trainingItem.endDate));
                                            angular.forEach(occurrences, function (item1, index1) {
                                                if (trainingItem.durationMetricId == 1) {
                                                    //Hour
                                                    $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration * 60);
                                                    if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                        if (trainingItem.userId == null) {
                                                            $scope.trainingProfileHoursToday += (trainingItem.duration * 60);
                                                        }

                                                    }
                                                    if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                        if (trainingItem.userId == null) {
                                                            $scope.trainingProfileHoursWeek += (trainingItem.duration * 60);
                                                        }

                                                    }
                                                    if (trainingItem.userId == null) {
                                                        $scope.totalProfileTrainingHours += (trainingItem.duration * 60);
                                                    }

                                                }
                                                if (trainingItem.durationMetricId == 3) {
                                                    //Minutes
                                                    $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration);
                                                    if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                        if (trainingItem.userId == null) {
                                                            $scope.trainingProfileHoursToday += (trainingItem.duration);
                                                        }

                                                    }
                                                    if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                        if (trainingItem.userId == null) {
                                                            $scope.trainingProfileHoursWeek += (trainingItem.duration);
                                                        }

                                                    }
                                                    if (trainingItem.userId == null) {
                                                        $scope.totalProfileTrainingHours += (trainingItem.duration);
                                                    }

                                                }
                                                if (trainingItem.durationMetricId == 4) {
                                                    //Seconds
                                                    $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration / 60);
                                                    if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                        if (trainingItem.userId == null) {
                                                            $scope.trainingProfileHoursToday += (trainingItem.duration / 60);
                                                        }

                                                    }
                                                    if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                        if (trainingItem.userId == null) {
                                                            $scope.trainingProfileHoursWeek += (trainingItem.duration / 60);
                                                        }

                                                    }
                                                    if (trainingItem.userId == null) {
                                                        $scope.totalProfileTrainingHours += (trainingItem.duration / 60);
                                                    }

                                                }
                                                if (trainingItem.durationMetricId == 5) {
                                                    //Days
                                                    $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration * 1440);
                                                    if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                        if (trainingItem.userId == null) {
                                                            $scope.trainingProfileHoursToday += (trainingItem.duration * 1440);
                                                        }

                                                    }
                                                    if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                        if (trainingItem.userId == null) {
                                                            $scope.trainingProfileHoursWeek += (trainingItem.duration * 1440);
                                                        }

                                                    }
                                                    if (trainingItem.userId == null) {
                                                        $scope.totalProfileTrainingHours += (trainingItem.duration * 1440);
                                                    }

                                                }
                                                startDates.push(item1.start)
                                            });
                                        }
                                    }
                                }
                            });
                            var sortedStartDate = _.sortBy(startDates, function (dateItem) {
                                return -(kendo.parseDate(dateItem).getTime());
                            });
                            $scope.trainingStartDate = sortedStartDate[sortedStartDate.length - 1];
                            $scope.trainingEndDate = sortedStartDate[0];
                            if ($scope.weekEndDate > $scope.trainingEndDate) {
                                $scope.weekEndDate = $scope.trainingEndDate;
                            }
                            $scope.isTimeCalculated = true;
                            $scope.totalProfileTrainingTodayResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHoursToday, $scope.trainingProfileHoursToday)
                            $scope.totalProfileTrainingWeekResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHoursWeek, $scope.trainingProfileHoursWeek)
                            $scope.totalProfileTrainingResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHours, $scope.totalProfileTrainingHours)
                        });
                    }
                    trainingsDiaryService.getUserStats($scope.currentUser.user.id).then(function (data) {
                        $scope.userStats = data;
                    });
                    //trainingdiary/GetUserTrainingsForTimeCalculation/{userId}
                    if ($("#UerStateScorecardGrid").data("kendoGrid")) {
                        $("#UerStateScorecardGrid").kendoGrid("destroy");
                        $("#UerStateScorecardGrid").html("");
                    }
                    if ($("#UerKPIProgressGrid").data("kendoGrid")) {
                        $("#UerKPIProgressGrid").kendoGrid("destroy");
                        $("#UerKPIProgressGrid").html("");
                    }
                    if ($("#userStatsUpComingTasksGrid").data("kendoGrid")) {
                        $("#userStatsUpComingTasksGrid").kendoGrid("destroy");
                        $("#userStatsUpComingTasksGrid").html("");
                    }
                    $scope.events = [];
                    $scope.tasks = [];
                    $("[data-target='#tab_Tasks']").click();
                    $scope.UserStatTabChange('Training');
                }
                if (viewName == "settings") {
                }
                if (viewName == "reports") {
                }
            }
            $scope.UserStatTabChange = function (viewName) {
                if (viewName == "Scorecard") {
                    var scorcarddata = [];
                    var today = new Date();
                    today = today.setHours(0, 0, 0, 0);
                    if ($scope.activeProfile) {
                        var profile = $scope.activeProfile
                        _.forEach(profile.ipsTrainingDiaryStages, function (stage) {
                            _.forEach(stage.evaluationAgreement, function (evaluationAgreement) {
                                var scoreCardObj = { profileid: 0, profile: "", stageId: 0, stage: "", skill: "", start: "", end: "", performance: "", progress: 0, finalGoal: 0, score: 0, participantId: $scope.currentUser.user.id, evalutorId: null, kpitype: null, role: "", isActiveStage: false };
                                scoreCardObj.role = getParticipantOrEvaluator(profile.profile),
                                    scoreCardObj.evalutorId = profile.profile.evalutorId;
                                if (evaluationAgreement.participantId) {
                                    scoreCardObj.participantId = evaluationAgreement.participantId;
                                }
                                scoreCardObj.profileid = profile.profile.id;
                                scoreCardObj.profile = profile.profile.name;
                                scoreCardObj.stage = stage.name;
                                scoreCardObj.stageId = stage.id;
                                scoreCardObj.start = stage.startDate;
                                scoreCardObj.end = stage.endDate;
                                scoreCardObj.kpitype = (evaluationAgreement.kpiType == 1 ? "weak" : evaluationAgreement.kpiType == 2 ? "strong" : "");
                                scoreCardObj.score = evaluationAgreement.finalScore;
                                scoreCardObj.skill = (evaluationAgreement.question.skills.length > 0 ? evaluationAgreement.question.skills[0].name : "");
                                scoreCardObj.skillId = (evaluationAgreement.question.skills.length > 0 ? evaluationAgreement.question.skills[0].id : null);
                                var stageIndex = profile.ipsTrainingDiaryStages.findIndex(function (item) { return item.id == evaluationAgreement.stageId })
                                if (stageIndex > -1) {
                                    if (stageIndex == 0) {
                                        if (evaluationAgreement.milestoneAgreementGoals.length > 0) {
                                            var nextMilestoneGoal = evaluationAgreement.milestoneAgreementGoals[0].goal;
                                            scoreCardObj.finalGoal = nextMilestoneGoal;
                                            if (evaluationAgreement.finalScore == nextMilestoneGoal) {
                                                scoreCardObj.performance = "Equal"
                                            }
                                            else {
                                                scoreCardObj.performance = (evaluationAgreement.finalScore > nextMilestoneGoal ? "Up" : "Down");
                                            }
                                            var avg = (evaluationAgreement.finalScore / nextMilestoneGoal);
                                            if (!isNaN(avg)) {
                                                scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                            }
                                        }
                                        else {
                                            scoreCardObj.finalGoal = null;
                                            scoreCardObj.performance = "hide";//$scope.getProgressClass(evaluationAgreement.finalScore, evaluationAgreement.shortGoal);
                                            var avg = (evaluationAgreement.finalScore / evaluationAgreement.shortGoal);
                                            if (!isNaN(avg)) {
                                                scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                            }
                                        }
                                    }
                                    else {
                                        if (evaluationAgreement.milestoneAgreementGoals.length > 0) {
                                            var nextMilestoneGoal = 0;
                                            if (evaluationAgreement.milestoneAgreementGoals[stageIndex]) {
                                                nextMilestoneGoal = evaluationAgreement.milestoneAgreementGoals[stageIndex].goal;
                                            }
                                            else if ((stageIndex - 1) == evaluationAgreement.milestoneAgreementGoals.length) {
                                                nextMilestoneGoal = evaluationAgreement.milestoneAgreementGoals[stageIndex - 1].goal;
                                            }
                                            if (evaluationAgreement.finalScore == nextMilestoneGoal) {
                                                scoreCardObj.performance = "Equal"
                                            }
                                            else {
                                                scoreCardObj.performance = (evaluationAgreement.finalScore > nextMilestoneGoal ? "Up" : "Down");
                                            }
                                            var avg = (evaluationAgreement.finalScore / nextMilestoneGoal);
                                            if (!isNaN(avg)) {
                                                scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                            }
                                        }
                                        else {
                                            if (stageIndex == 1) {
                                                scoreCardObj.finalGoal = evaluationAgreement.shortGoal
                                                scoreCardObj.performance = $scope.getProgressClass(evaluationAgreement.finalScore, evaluationAgreement.shortGoal);
                                                var avg = (evaluationAgreement.finalScore / evaluationAgreement.shortGoal);
                                                if (!isNaN(avg)) {
                                                    scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                                }
                                            }
                                            else if (stageIndex == 2) {
                                                scoreCardObj.finalGoal = evaluationAgreement.midGoal;
                                                scoreCardObj.performance = $scope.getProgressClass(evaluationAgreement.finalScore, evaluationAgreement.midGoal);
                                                var avg = (evaluationAgreement.finalScore / evaluationAgreement.midGoal);
                                                if (!isNaN(avg)) {
                                                    scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                                }
                                            }
                                            else if (stageIndex == 3) {
                                                scoreCardObj.finalGoal = evaluationAgreement.longGoal;
                                                scoreCardObj.performance = $scope.getProgressClass(evaluationAgreement.finalScore, evaluationAgreement.longGoal);
                                                var avg = (evaluationAgreement.finalScore / evaluationAgreement.longGoal);
                                                if (!isNaN(avg)) {
                                                    scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                                }
                                            }
                                            else if (stageIndex == 4) {
                                                scoreCardObj.finalGoal = evaluationAgreement.finalGoal;
                                                scoreCardObj.performance = $scope.getProgressClass(evaluationAgreement.finalScore, evaluationAgreement.finalGoal);
                                                var avg = (evaluationAgreement.finalScore / evaluationAgreement.finalGoal);
                                                if (!isNaN(avg)) {
                                                    scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                                }
                                            }
                                        }
                                    }
                                }
                                scorcarddata.push(scoreCardObj);
                            });
                        });
                    }
                    if ($("#UerStateScorecardGrid").data("kendoGrid")) {
                        $("#UerStateScorecardGrid").kendoGrid("destroy");
                        $("#UerStateScorecardGrid").html("");
                    }
                    $("#UerStateScorecardGrid").kendoGrid({
                        dataBound: $scope.onUserAssignGridDataBound,
                        dataSource: {
                            type: "json",
                            data: scorcarddata,
                            group: { field: "profileid", field: "skill" },
                            pageSize: 10,
                            sort: { field: "stageId", dir: "asc" },
                        },
                        groupable: false, // this will remove the group bar
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
                        resizable: true,
                        columns: [
                            {
                                field: "start", title: $translate.instant('COMMON_PERIOD'), width: "130px",
                                template: function (data, value) {
                                    return moment(kendo.parseDate(data.start)).format('L LT') + " - " + moment(kendo.parseDate(data.end)).format('L LT')
                                }
                            },
                            {
                                field: "profile", title: $translate.instant('COMMON_PROFILE'), width: "130px"
                            },
                            {
                                field: "role",
                                title: "Role",
                                width: "100px",
                                filterable: false
                            },
                            { field: "skill", title: $translate.instant('COMMON_SKILL') + "(" + $translate.instant('COMMON_KPI') + ")", width: "150px", },
                            {
                                field: "kpitype", title: $translate.instant('COMMON_KPI_TYPE'), width: "150px", template: "<span title='#=kpitype#' class='scale-circle #=kpitype#'></span>",
                                filterable: false, sortable: false,
                            },
                            { field: "stage", title: $translate.instant('COMMON_PERFORMANCE_EVALUATION'), width: "150px", },
                            { field: "score", title: $translate.instant('COMMON_SCORE'), width: "120px", },
                            { field: "finalGoal", title: $translate.instant('COMMON_GOAL'), width: "120px", },
                            { field: "performance", title: $translate.instant('COMMON_PERFORMANCE'), width: "150px", template: "<div class='trend-#: performance #'></div>", filterable: false, sortable: false, },
                            { field: "progress", title: $translate.instant('COMMON_PROGRESS'), width: "130px", template: "<span ng-class='getActiveStageVisibleClass(#:isActiveStage#)'> #: progress #%</span>", width: "10%", },
                            { field: "id", title: $translate.instant('COMMON_ACTION'), width: "100px", template: "<div class='icon-groups'><a class='fa fa-info-circle fa-lg' title='Dev Contract' ng-class='getActiveStageVisibleClass(#:isActiveStage#)' ng-click='gotoDevelopmentContractDetail(#:profileid#,#:stageId#,#:participantId#,null)'></a> <a class='fa fa-outdent fa-lg' title='Training Activity' ng-click='openKPITrainingActivity(#:stageId#,#:skillId#)'></a> <a class='fa fa-sticky-note-o fa-lg' title='Training Notes' ng-click='openKPITrainingNotes(#:stageId#,#:skillId#)'></a></div> ", filterable: false, sortable: false, }
                        ],
                    });
                    $("#UerStateScorecardGrid").kendoTooltip({
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
                    $compile($("#UerStateScorecardGrid"))($scope);
                }
                else if (viewName == "KPIProgress") {
                    var kpiProgressData = [];
                    var kpiStartStageData = [];
                    var kpiShortStageData = [];
                    var kpiMidGoalStageData = [];
                    var kpiLongTermGoalStageData = [];
                    var today = new Date();
                    today = today.setHours(0, 0, 0, 0);
                    if ($scope.activeProfile) {
                        var profile = $scope.activeProfile
                        _.forEach(profile.ipsTrainingDiaryStages, function (stage) {
                            _.forEach(stage.evaluationAgreement, function (evaluationAgreement) {
                                var scoreCardObj = { profileid: 0, profile: "", stageId: 0, stage: "", skill: "", skillId: null, start: "", end: "", performance: "", progress: 0, finalGoal: 0, score: 0, participantId: $scope.currentUser.user.id, evalutorId: null, kpitype: null, role: "", prevScore: 0, startScore: 0, };
                                scoreCardObj.role = getParticipantOrEvaluator(profile.profile),
                                    scoreCardObj.evalutorId = profile.profile.evalutorId;
                                if (evaluationAgreement.participantId) {
                                    scoreCardObj.participantId = evaluationAgreement.participantId;
                                }
                                scoreCardObj.profileid = profile.profile.id;
                                scoreCardObj.profile = profile.profile.name;
                                scoreCardObj.stage = stage.name;
                                scoreCardObj.stageId = stage.id;
                                scoreCardObj.start = stage.startDate;
                                scoreCardObj.end = stage.endDate;
                                scoreCardObj.kpitype = (evaluationAgreement.kpiType == 1 ? "weak" : evaluationAgreement.kpiType == 2 ? "strong" : "");
                                scoreCardObj.score = evaluationAgreement.finalScore;
                                scoreCardObj.skill = (evaluationAgreement.question.skills.length > 0 ? evaluationAgreement.question.skills[0].name : "");
                                scoreCardObj.skillId = (evaluationAgreement.question.skills.length > 0 ? evaluationAgreement.question.skills[0].id : null);
                                var stageIndex = profile.ipsTrainingDiaryStages.findIndex(function (item) { return item.id == evaluationAgreement.stageId })
                                if (stageIndex > -1) {
                                    if (stageIndex == 0) {
                                        kpiStartStageData.push(scoreCardObj);
                                    }
                                    else {
                                        if (evaluationAgreement.milestoneAgreementGoals.length > 0) {
                                            var nextMilestoneGoal = 0;
                                            var currentMilestoneGoal = evaluationAgreement.milestoneAgreementGoals[stageIndex - 1].goal;
                                            if (evaluationAgreement.milestoneAgreementGoals[stageIndex]) {
                                                nextMilestoneGoal = evaluationAgreement.milestoneAgreementGoals[stageIndex].goal;
                                            }
                                            else if ((stageIndex - 1) == evaluationAgreement.milestoneAgreementGoals.length) {
                                                nextMilestoneGoal = evaluationAgreement.milestoneAgreementGoals[stageIndex - 1].goal;
                                            }
                                            scoreCardObj.finalGoal = currentMilestoneGoal;
                                            if (evaluationAgreement.finalScore == nextMilestoneGoal) {
                                                scoreCardObj.performance = "Equal"
                                            }
                                            else {
                                                scoreCardObj.performance = (evaluationAgreement.finalScore > nextMilestoneGoal ? "Up" : "Down");
                                            }
                                            var avg = (evaluationAgreement.finalScore / nextMilestoneGoal);
                                            if (!isNaN(avg)) {
                                                scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                            }
                                            var prevStageData = _.find(kpiStartStageData, function (dataItem) {
                                                return dataItem.skillId == evaluationAgreement.question.skills[0].id;
                                            })
                                            if (prevStageData) {
                                                scoreCardObj.prevScore = prevStageData.score;
                                                scoreCardObj.startScore = prevStageData.score;
                                            }
                                            kpiShortStageData.push(scoreCardObj);
                                        }
                                        else {
                                            if (stageIndex == 1) {
                                                scoreCardObj.finalGoal = evaluationAgreement.shortGoal;
                                                if (evaluationAgreement.finalScore == evaluationAgreement.shortGoal) {
                                                    scoreCardObj.performance = "Equal"
                                                }
                                                else {
                                                    scoreCardObj.performance = (evaluationAgreement.finalScore > evaluationAgreement.shortGoal ? "Up" : "Down");
                                                }
                                                var avg = (evaluationAgreement.finalScore / evaluationAgreement.shortGoal);
                                                if (!isNaN(avg)) {
                                                    scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                                }
                                                var prevStageData = _.find(kpiStartStageData, function (dataItem) {
                                                    return dataItem.skillId == evaluationAgreement.question.skills[0].id;
                                                })
                                                if (prevStageData) {
                                                    scoreCardObj.prevScore = prevStageData.score;
                                                    scoreCardObj.startScore = prevStageData.score;
                                                }
                                                kpiShortStageData.push(scoreCardObj);
                                            }
                                            else if (stageIndex == 2) {
                                                scoreCardObj.finalGoal = evaluationAgreement.midGoal;
                                                if (evaluationAgreement.finalScore == evaluationAgreement.midGoal) {
                                                    scoreCardObj.performance = "Equal"
                                                }
                                                else {
                                                    scoreCardObj.performance = (evaluationAgreement.finalScore > evaluationAgreement.midGoal ? "Up" : "Down");
                                                }
                                                var avg = (evaluationAgreement.finalScore / evaluationAgreement.midGoal);
                                                if (!isNaN(avg)) {
                                                    scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                                }
                                                var prevStageData = _.find(kpiShortStageData, function (dataItem) {
                                                    return dataItem.skillId == evaluationAgreement.question.skills[0].id;
                                                });
                                                if (prevStageData) {
                                                    scoreCardObj.prevScore = prevStageData.score;
                                                }
                                                var startStageData = _.find(kpiStartStageData, function (dataItem) {
                                                    return dataItem.skillId == evaluationAgreement.question.skills[0].id;
                                                })
                                                if (startStageData) {
                                                    scoreCardObj.startScore = startStageData.score;
                                                }
                                                kpiMidGoalStageData.push(scoreCardObj);
                                            }
                                            else if (stageIndex == 3) {
                                                scoreCardObj.finalGoal = evaluationAgreement.longGoal;
                                                if (evaluationAgreement.finalScore == evaluationAgreement.longGoal) {
                                                    scoreCardObj.performance = "Equal"
                                                }
                                                else {
                                                    scoreCardObj.performance = (evaluationAgreement.finalScore > evaluationAgreement.longGoal ? "Up" : "Down");
                                                }
                                                var avg = (evaluationAgreement.finalScore / evaluationAgreement.longGoal);
                                                if (!isNaN(avg)) {
                                                    scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                                }
                                                var prevStageData = _.find(kpiMidGoalStageData, function (dataItem) {
                                                    return dataItem.skillId == evaluationAgreement.question.skills[0].id;
                                                })
                                                if (prevStageData) {
                                                    scoreCardObj.prevScore = prevStageData.score;
                                                }
                                                var startStageData = _.find(kpiStartStageData, function (dataItem) {
                                                    return dataItem.skillId == evaluationAgreement.question.skills[0].id;
                                                })
                                                if (startStageData) {
                                                    scoreCardObj.startScore = startStageData.score;
                                                }
                                                kpiLongTermGoalStageData.push(scoreCardObj);
                                            }
                                            else if (stageIndex == 4) {
                                                scoreCardObj.finalGoal = evaluationAgreement.finalGoal;
                                                if (evaluationAgreement.finalScore == evaluationAgreement.finalGoal) {
                                                    scoreCardObj.performance = "Equal"
                                                }
                                                else {
                                                    scoreCardObj.performance = (evaluationAgreement.finalScore > evaluationAgreement.finalGoal ? "Up" : "Down");
                                                }
                                                var avg = (evaluationAgreement.finalScore / evaluationAgreement.finalGoal);
                                                if (!isNaN(avg)) {
                                                    scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                                }
                                                var prevStageData = _.find(kpiLongTermGoalStageData, function (dataItem) {
                                                    return dataItem.skillId == evaluationAgreement.question.skills[0].id;
                                                })
                                                if (prevStageData) {
                                                    scoreCardObj.prevScore = prevStageData.score;
                                                }
                                                var startStageData = _.find(kpiStartStageData, function (dataItem) {
                                                    return dataItem.skillId == evaluationAgreement.question.skills[0].id;
                                                })
                                                if (startStageData) {
                                                    scoreCardObj.startScore = startStageData.score;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (stageIndex > 0) {
                                    if (kendo.parseDate(profile.ipsTrainingDiaryStages[stageIndex].startDate) < today && kendo.parseDate(profile.ipsTrainingDiaryStages[stageIndex].endDate) > today) {
                                        scoreCardObj.score = null;
                                        scoreCardObj.performance = null;
                                        scoreCardObj.progress = null;
                                        scoreCardObj.isActiveStage = true;
                                    }
                                    kpiProgressData.push(scoreCardObj);
                                }
                            });
                        });
                    }
                    if ($("#UerKPIProgressGrid").data("kendoGrid")) {
                        $("#UerKPIProgressGrid").kendoGrid("destroy");
                        $("#UerKPIProgressGrid").html("");
                    }
                    $("#UerKPIProgressGrid").kendoGrid({
                        dataBound: $scope.onUserAssignGridDataBound,
                        dataSource: {
                            type: "json",
                            data: kpiProgressData,
                            group: { field: "profileid", field: "skill" },
                            pageSize: 10,
                            sort: { field: "stageId", dir: "asc" },
                        },
                        groupable: false, // this will remove the group bar
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
                        resizable: true,
                        columns: [
                            {
                                field: "start", title: $translate.instant('COMMON_PERIOD'), width: "130px",
                                template: function (data, value) {
                                    return moment(kendo.parseDate(data.start)).format('L LT') + " - " + moment(kendo.parseDate(data.end)).format('L LT')
                                }
                            },
                            {
                                field: "profile", title: $translate.instant('COMMON_PROFILE'), width: "130px",
                            },
                            {
                                field: "role",
                                title: $translate.instant('COMMON_ROLE'),
                                width: "110px",
                                filterable: false
                            },
                            {
                                field: "skill", title: $translate.instant('COMMON_SKILL') + "(" + $translate.instant('COMMON_KPI') + ")"
                            },
                            {
                                field: "kpitype", title: $translate.instant('COMMON_KPI_TYPE'), width: "130px", template: "<span title='#=kpitype#' class='scale-circle #=kpitype#'></span>",
                                filterable: false, sortable: false,
                            },
                            { field: "startScore", title: $translate.instant('COMMON_START'), width: "120px" },
                            { field: "stage", title: $translate.instant('COMMON_PERFORMANCE_EVALUATION'), width: "150px" },
                            { field: "prevScore", title: $translate.instant('COMMON_PREV_SCORE'), width: "170px" },
                            { field: "score", title: $translate.instant('COMMON_CURRENT_SCORE'), width: "200px" },
                            { field: "finalGoal", title: $translate.instant('COMMON_GOAL'), width: "110px" },
                            { field: "performance", title: $translate.instant('COMMON_PERFORMANCE'), width: "150px", template: "<div class='' ng-class='getProgressClass(#:score#,#:finalGoal#)'></div>", filterable: false, sortable: false, },
                            { field: "id", title: $translate.instant('COMMON_ACTION'), width: "110px", template: "<div class='icon-groups'><a class='fa fa-info-circle fa-lg' title='Training Activity'  ng-click='openKPITrainingActivity(#:stageId#,#:skillId#)'> </a> <a class='fa fa-outdent fa-lg' title='Training Notes' ng-show='checkKPITrainingHasNotes(#:stageId#,#:skillId#)' ng-click='openKPITrainingNotes(#:stageId#,#:skillId#)'></a></div>", filterable: false, sortable: false, }
                        ],
                    });
                    $("#UerKPIProgressGrid").kendoTooltip({
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
                    $compile($("#UerKPIProgressGrid"))($scope);
                }
                else if (viewName == "Training") {
                    $scope.trainingDiaryViewId = trainingDiaryViewEnum.Today;
                    $scope.trainingDiaryViewChanged();
                }
                else if (viewName == "EvaluationFeedback") {
                    $scope.evaluationFeedbackDDLChanged();
                }
            }
            $scope.getActiveStageVisibleClass = function (value) {
                if (value) {
                    return 'hide'
                }
            }
            $scope.getProgressClass = function (score, goalScore) {
                if (score != null) {
                    var result = score - goalScore;
                    if (result == 0) {
                        return 'progress-reached';
                    }
                    if (result < 0) {
                        return 'progress-notmet';
                    }
                    if (result > 0) {
                        return 'progress-exceeded';
                    }
                }
            }
            $scope.userStatsTasksGridDetailInit = function () {
                var detailRow = e.detailRow;
            }
            $scope.gotoDevelopmentContractDetail = function (profileId, stageId, evalutorId, stageEvolutionId) {
                stageEvolutionId = 'null';
                $location.path("/home/previewFinalKPI/" + profileId + "/" + stageId + "/" + evalutorId + "/" + stageEvolutionId + "/devContract");
            };
            $scope.openKPITrainingActivity = function (stageId, skillId) {
                var title = "";
                $scope.KPITrainingFeedback = [];
                if ($scope.activeProfile) {
                    title = $scope.activeProfile.profile.name;
                    _.forEach($scope.activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                        if (stageItem.evaluationAgreement && stageItem.id == stageId) {
                            title += " (" + stageItem.name + ")";
                            _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                if (evaluationAgreementItem.trainings) {
                                    _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                        var currentSkillId = trainingItem.skills.length > 0 ? trainingItem.skills[0].id : 0;
                                        if (currentSkillId == skillId) {
                                            if (trainingItem.trainingFeedbacks.length > 0) {
                                                _.each(trainingItem.trainingFeedbacks, function (trainingFeedbackItem) {
                                                    trainingFeedbackItem["title"] = trainingItem.name;
                                                    trainingFeedbackItem["skill"] = trainingItem.skills.length > 0 ? trainingItem.skills[0].name : "";
                                                    if (trainingFeedbackItem.evaluatorId == null) {
                                                        $scope.KPITrainingFeedback.push(trainingFeedbackItem);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                    var columns = [
                        { field: "title", title: $translate.instant('COMMON_TRAINING'), width: "20%" },
                        { field: "skill", title: $translate.instant('COMMON_SKILL'), width: "20%" },
                        {
                            field: "startedAt", title: $translate.instant('COMMON_TRAINING_STARTED'), width: "20%", template: function (data, value) {
                                if (data.startedAt) {
                                    return moment(kendo.parseDate(data.startedAt)).format('L LT')
                                }
                                else {
                                    return "";
                                }
                            }
                        },
                        {
                            field: "feedbackDateTime", title: $translate.instant('COMMON_TRAINING_ENDED'), width: "15%", template: function (data, value) {
                                return moment(kendo.parseDate(data.feedbackDateTime)).format('L LT')
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
                        { field: "timeSpentMinutes", title: $translate.instant('COMMON_TIME_SPENT') + "(" + $translate.instant('COMMON_MINUTES') + ")", width: "20%" },
                    ];
                    var windowDiv = $('#gridDialogWindow');
                    var dialog = windowDiv.data("kendoWindow");
                    if (dialog) {
                        dialog.close();
                    }
                    dialogService.showGridDialog($translate.instant('TRAININGDAIRY_TRAINING_EVALUATION_FEEDBACKS') + " - " + title, $scope.KPITrainingFeedback, columns);
                }
            }

            $scope.checkKPITrainingHasNotes = function (stageId, skillId) {
                var result = false;
                if ($scope.activeProfile) {
                    var KPITrainingNotes = [];
                    _.forEach($scope.activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                        if (stageItem.evaluationAgreement && stageItem.id == stageId) {
                            _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                if (evaluationAgreementItem.trainings) {
                                    _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                        var currentSkillId = trainingItem.skills.length > 0 ? trainingItem.skills[0].id : 0;
                                        if (currentSkillId == skillId) {
                                            if (trainingItem.ipsTrainingNotes) {
                                                _.each(trainingItem.ipsTrainingNotes, function (trainingNotes) {
                                                    KPITrainingNotes.push(trainingNotes);
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                    if (KPITrainingNotes.length > 0) {
                        result = true;
                    }
                }
                return result;
            }
            $scope.openKPITrainingNotes = function (stageId, skillId) {
                var title = "";
                $scope.KPITrainingNotes = [];
                if ($scope.activeProfile) {
                    title = $scope.activeProfile.profile.name;
                    _.forEach($scope.activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                        if (stageItem.evaluationAgreement && stageItem.id == stageId) {
                            title += " (" + stageItem.name + ")";
                            _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                if (evaluationAgreementItem.trainings) {
                                    _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                        var currentSkillId = trainingItem.skills.length > 0 ? trainingItem.skills[0].id : 0;
                                        if (currentSkillId == skillId) {
                                            if (trainingItem.ipsTrainingNotes) {
                                                _.each(trainingItem.ipsTrainingNotes, function (trainingNotes) {
                                                    trainingNotes["title"] = trainingItem.name;
                                                    trainingNotes["skill"] = trainingItem.skills.length > 0 ? trainingItem.skills[0].name : "";
                                                    $scope.KPITrainingNotes.push(trainingNotes);
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                    var columns = [
                        { field: "title", title: $translate.instant('COMMON_TITLE'), width: "20%" },
                        { field: "skill", title: $translate.instant('COMMON_SKILL'), width: "20%" },
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
                    dialogService.showGridDialog($translate.instant('TRAININGDAIRY_TRAINING_NOTES') + " - " + title, $scope.KPITrainingNotes, columns);
                }
            }
            $scope.sendProfileEvalutionReminderNotificaition = function (profileId, stageId, participantId) {
                apiService.ajax('trainingdiary/SendProfileEvalutionReminderNotificaition', 'post', { profileId: profileId, stageId: stageId, participantId: participantId }, { success: sendSuccess, error: sendError });
            }
            $scope.openAgendaDetail = function (eventType, Id, $event) {
                if (eventType == eventTypeEnum.ProfileTraining || eventType == eventTypeEnum.EvaluateParticipantTraining) {
                    if (Id > 0) {
                        var html = '<project-training-popup organization-id="currentUser.user.organizationId"' +
                            'user-id="currentUser.user.userId"' +
                            'open-project-training-popup-mode="openProjectTrainingPopupMode"' +
                            'save-mode="saveMode"' +
                            'editing-training="editingTraining"' +
                            'skill="activeSkill"' +
                            'evaluation-Agreement="evaluationAgreement"' +
                            'stage="activeStage">' +
                            '</project-training-popup>';
                        var linkFn = $compile(html);
                        var content = linkFn($scope);
                        $("#project-training-popup-div").html(content);
                        trainingsDiaryService.getById(Id).then(function (data) {
                            $scope.editingTraining = data;
                            if ($scope.editingTraining.skills) {
                                if ($scope.editingTraining.skills.length > 0) {
                                    $scope.editingTraining["skillId"] = $scope.editingTraining.skills[0].id;
                                }
                            }
                            $scope.saveMode = trainingSaveModeEnum.view;
                            $scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup = true;
                        }, function () {
                            $scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup = false;
                            dialogService.showNotification("Something went worng!!", "error");
                        });
                    }
                    else {
                        $scope.editingTraining = null;
                        if ($($event.target).parents(".k-widget").hasClass("k-grid")) {
                            var gridData = $($($event.target).parents(".k-widget")).data("kendoGrid");
                            if (gridData) {
                                var gridDataSource = gridData.dataSource.data();
                                var gridDataObj = _.find(gridDataSource, function (xItem) {
                                    return xItem.eventType == eventTypeEnum.ProfileTraining && xItem.orginalId == Id;
                                })
                                if (gridDataObj) {
                                    var html = '<project-training-popup organization-id="currentUser.user.organizationId"' +
                                        'user-id="currentUser.user.userId"' +
                                        'open-project-training-popup-mode="openProjectTrainingPopupMode"' +
                                        'save-mode="saveMode"' +
                                        'editing-training="editingTraining"' +
                                        'skill="activeSkill"' +
                                        'evaluation-Agreement="evaluationAgreement"' +
                                        'stage="activeStage">' +
                                        '</project-training-popup>';
                                    var linkFn = $compile(html);
                                    var content = linkFn($scope);
                                    $("#project-training-popup-div").html(content);
                                    $scope.editingTraining = {
                                        id: Id,
                                        name: gridDataObj.title,
                                        what: null,
                                        how: null,
                                        why: null,
                                        additionalInfo: gridDataObj.description,
                                        levelId: null,
                                        frequency: "Never",
                                        duration: null,
                                        durationMetricId: null,
                                        typeId: null,
                                        isTemplate: false,
                                        isActive: null,
                                        organizationId: null,
                                        startDate: moment(kendo.parseDate(gridDataObj.start)).format('L LT'),
                                        endDate: moment(kendo.parseDate(gridDataObj.end)).format('L LT'),
                                        howMany: null,
                                        exerciseMetricId: null,
                                        howManySets: null,
                                        howManyActions: null,
                                        userId: null,
                                        skillId: gridDataObj.skillId,
                                        isNotificationBySMS: false,
                                        isNotificationByEmail: false,
                                        notificationTemplateId: null,
                                        emailBefore: null,
                                        smsBefore: null,
                                        trainingMaterials: [],
                                        trainingFeedbacks: [],
                                        link_PerformanceGroupSkills: null,
                                    }
                                    $scope.saveMode = trainingSaveModeEnum.view;
                                    $scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup = true;
                                }
                            }
                            else {
                                dialogService.showNotification($translate.instant('TRAININGDAIRY_YOU_CAN_NOT_OPEN') + " " + $translate.instant('TRAININGDAIRY_FREE_TEXT') + $translate.instant('COMMON_TRAINING'), "info");
                            }
                        }
                        else if ($($event.target).parents(".k-widget").hasClass("k-scheduler")) {
                            var calenderData = $($($event.target).parents(".k-widget")).data("kendoScheduler");
                            if (calenderData) {
                                var calenderDataSource = calenderData.dataSource.data();
                                var calenderDataObj = _.find(calenderDataSource, function (xItem) {
                                    return xItem.eventType == eventTypeEnum.ProfileTraining && xItem.orginalId == Id;
                                })
                                if (calenderDataObj) {
                                    var html = '<project-training-popup organization-id="currentUser.user.organizationId"' +
                                        'user-id="currentUser.user.userId"' +
                                        'open-project-training-popup-mode="openProjectTrainingPopupMode"' +
                                        'save-mode="saveMode"' +
                                        'editing-training="editingTraining"' +
                                        'skill="activeSkill"' +
                                        'evaluation-Agreement="evaluationAgreement"' +
                                        'stage="activeStage">' +
                                        '</project-training-popup>';
                                    var linkFn = $compile(html);
                                    var content = linkFn($scope);
                                    $("#project-training-popup-div").html(content);
                                    $scope.editingTraining = {
                                        id: Id,
                                        name: calenderDataObj.title,
                                        what: null,
                                        how: null,
                                        why: null,
                                        additionalInfo: calenderDataObj.description,
                                        levelId: null,
                                        frequency: "Never",
                                        duration: null,
                                        durationMetricId: null,
                                        typeId: null,
                                        isTemplate: false,
                                        isActive: null,
                                        organizationId: null,
                                        startDate: moment(kendo.parseDate(calenderDataObj.start)).format('L LT'),
                                        endDate: moment(kendo.parseDate(calenderDataObj.end)).format('L LT'),
                                        howMany: null,
                                        exerciseMetricId: null,
                                        howManySets: null,
                                        howManyActions: null,
                                        userId: null,
                                        skillId: calenderDataObj.skillId,
                                        isNotificationBySMS: false,
                                        isNotificationByEmail: false,
                                        notificationTemplateId: null,
                                        emailBefore: null,
                                        smsBefore: null,
                                        trainingMaterials: [],
                                        trainingFeedbacks: [],
                                        skills: [{ id: null, name: calenderDataObj.title }],
                                        link_PerformanceGroupSkills: null,
                                    }
                                    $scope.saveMode = trainingSaveModeEnum.view;
                                    $scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup = true;
                                }
                            }
                            else {
                                dialogService.showNotification($translate.instant('TRAININGDAIRY_YOU_CAN_NOT_OPEN') + $translate.instant('TRAININGDAIRY_FREE_TEXT') + $translate.instant('COMMON_TRAINING'), "info");
                            }
                        }
                    }
                }
                else if (eventType == eventTypeEnum.Task) {
                    var html = '<div><task-detail-popup task-detail="taskDetail"' +
                        'task-categories="taskCategories"' +
                        'task-statuses="taskStatuses"' +
                        'task-priorities="taskPriorities"' +
                        'notification-templates="notificationTemplates"' +
                        'open-task-detail-popup-mode="openTaskDetailPopupMode">' +
                        '</task-detail-popup></div>';
                    var linkFn = $compile(html);
                    var content = linkFn($scope);
                    $("#task-detail-popup-div").html(content);
                    trainingdiaryManager.getTaskById(Id).then(function (data) {
                        trainingdiaryManager.getTaskListById(data.taskListId).then(function (taskListData) {
                            $scope.taskCategories = [];
                            $scope.taskStatuses = [];
                            $scope.taskPriorities = [];
                            if (taskListData) {
                                trainingdiaryManager.getTaskCategoriesById(taskListData.taskCategoryListsId).then(function (result) {
                                    $scope.taskCategories = result;
                                });
                                trainingdiaryManager.getTaskStatusesById(taskListData.taskStatusListId).then(function (result) {
                                    $scope.taskStatuses = result;
                                });
                                trainingdiaryManager.getTaskPrioritiesById(taskListData.taskPriorityListId).then(function (result) {
                                    $scope.taskPriorities = result;
                                })
                            }
                        });
                        data.viewName = data.title;
                        data.startDate = data.startDate ? moment(kendo.parseDate(data.startDate)).format('L LT') : "";
                        data.dueDate = data.dueDate ? moment(kendo.parseDate(data.dueDate)).format('L LT') : "";
                        $scope.taskDetail = data;
                        $scope.taskDetail.timeEstimateMinutes = $scope.taskDetail.timeEstimateMinutes == null ? 0 : $scope.taskDetail.timeEstimateMinutes;
                        $scope.taskDetail.timeSpentMinutes = $scope.taskDetail.timeSpentMinutes == null ? 0 : $scope.taskDetail.timeSpentMinutes;
                        $scope.openTaskDetailPopupMode.isPopupOpen = true;
                    });
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
                else {
                    $compile(e.sender.element)($scope);
                }
            };
            $scope.recurrenceTaskCompleted = function (taskId, id) {
                var task = _.filter($scope.tasks, function (taskItem) {
                    return taskItem.orginalId == taskId && taskItem.id == id;
                });
                if (task.length > 0) {
                    task = task[0];
                }
                if (task) {
                    $scope.taskActivity = {
                        taskId: taskId,
                        recurrenceStartTime: moment(kendo.parseDate(task.start)).format('L LT'),
                        recurrenceEndTime: moment(kendo.parseDate(task.end)).format('L LT'),
                        recurrencesRule: task.recurrencesRule,
                    };
                    trainingdiaryManager.recurrenceTaskCompleted($scope.taskActivity).then(function (data) {
                        if (data.id > 0) {
                            dialogService.showNotification($translate.instant('TRAININGDAIRY_TASK_ACTIVITY_SAVED_SUCCESSFULLY'), "success");
                            var ds = new kendo.data.ObservableArray([]);
                            var ipsCalenderEventFilterModel = {
                                userId: $scope.currentUser.user.id,
                                startDate: null,
                                endDate: null
                            };
                            trainingsDiaryService.getEventsByUserId(ipsCalenderEventFilterModel).then(function (data) {
                                angular.forEach(data, function (item, index) {
                                    var event = new kendo.data.SchedulerEvent({
                                        id: item.id,
                                        description: item.description,
                                        title: item.title,
                                        start: kendo.parseDate(item.start), //item1.start,
                                        end: kendo.parseDate(item.end),
                                        recurrenceRule: item.recurrenceRule,
                                        eventType: item.eventType,
                                        isAllDay: moment(kendo.parseDate(item.start)).format("HHmmss") == "000000",
                                        color: item.eventType == eventTypeEnum.Task ? "#F6B94D" : "#C94D09",
                                        taskListId: taskList ? taskList.id : 0,
                                        statusId: item.statusId,
                                        categoryId: item.categoryId,
                                        priorityId: item.priorityId
                                    });
                                    var occurrences = event.expand(kendo.parseDate(item.start), kendo.parseDate(item.end));
                                    var recurrence = -1;
                                    angular.forEach(occurrences, function (item1, index1) {
                                        var isRecurrenceDone = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                            if (item.eventType == eventTypeEnum.Task) {
                                                if (itemfeedback.recurrencesStartTime) {
                                                    return itemfeedback.taskId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime();
                                                }
                                            }
                                            else {
                                                if (itemfeedback.recurrencesStartTime) {
                                                    return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime();
                                                }
                                            }
                                        });
                                        var endTime = kendo.parseDate(moment(kendo.parseDate(item1.start)).endOf("day")._d);
                                        if (!(occurrences[index1 + 1])) {
                                            if (endTime.getTime() > kendo.parseDate(item.end).getTime()) {
                                                endTime = kendo.parseDate(item.end);
                                            }
                                        }
                                        ds.push({
                                            "orginalId": item.id,
                                            "id": recurrence,
                                            "description": item1.description,
                                            "title": item1.title,
                                            "start": kendo.parseDate(moment(item1.start).format('L LT')),
                                            "end": endTime,
                                            "isAllDay": false,
                                            "eventType": item1.eventType,
                                            "color": item.eventType == eventTypeEnum.Task ? "#F6B94D" : "#C94D09",
                                            "taskListId": taskList ? taskList.id : 0,
                                            "statusId": item.statusId,
                                            "categoryId": item.categoryId,
                                            "priorityId": item.priorityId,
                                            "recurrencesRule": item.recurrenceRule,
                                            "isDone": isRecurrenceDone.length > 0 ? true : false,
                                            "duration": item.duration ? item.duration : 0,
                                            "durationMetric": item.durationMetricId
                                        })
                                        recurrence = recurrence - 1;
                                    });
                                });
                                angular.forEach($scope.profileTrainings, function (item, index) {
                                    var event = new kendo.data.SchedulerEvent({
                                        id: item.id,
                                        description: item.additionalInfo,
                                        title: item.name,
                                        start: kendo.parseDate(item.startDate), //item1.start,
                                        end: kendo.parseDate(item.endDate),
                                        recurrenceRule: item.frequency,
                                        eventType: eventTypeEnum.ProfileTraining,
                                        isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                        color: "#6CE26C",
                                        taskListId: -1,
                                        statusId: -1,
                                        categoryId: -1,
                                        priorityId: -1,
                                        isParticipant: item.isParticipant,
                                        participantName: item.participantName,
                                        isEvaluator: item.isEvaluator,
                                        evaluatorName: item.evaluatorName,
                                    });
                                    var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.endDate));
                                    var recurrence = -1;
                                    angular.forEach(occurrences, function (item1, index1) {
                                        var isRecurrenceDone = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                            if (itemfeedback.recurrencesStartTime) {
                                                return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime();
                                            }
                                        });
                                        var endTime = kendo.parseDate(moment(item1.start).endOf("day"));
                                        if (!(occurrences[index1 + 1])) {
                                            if (endTime.getTime() > kendo.parseDate(item.endDate).getTime()) {
                                                endTime = kendo.parseDate(moment(kendo.parseDate(item.endDate)));
                                            }
                                            if (item1.start.getTime() != endTime.getTime()) {
                                                ds.push({
                                                    "orginalId": item.id,
                                                    "id": recurrence,
                                                    "description": item1.description,
                                                    "title": item1.title,
                                                    "start": kendo.parseDate(moment(item1.start).format('L LT')), //"/Date(1523511510858)/", //item1.start,
                                                    "end": kendo.parseDate(moment(item1.start).add(30, 'minutes')._d), //"/Date(1523511510858)/"
                                                    "isAllDay": false,
                                                    "eventType": eventTypeEnum.ProfileTraining,
                                                    "color": "#6CE26C",
                                                    "taskListId": -1,
                                                    "statusId": -1,
                                                    "categoryId": -1,
                                                    "priorityId": -1,
                                                    "isDone": isRecurrenceDone.length > 0 ? true : false,
                                                    "isParticipant": item.isParticipant,
                                                    "participantName": item.participantName,
                                                    "isEvaluator": item.isEvaluator,
                                                    "evaluatorName": item.evaluatorName,
                                                    "duration": item.duration ? item.duration : 0,
                                                    "durationMetric": item.durationMetricId,
                                                })
                                            }
                                        }
                                        else {
                                            ds.push({
                                                "orginalId": item.id,
                                                "id": recurrence,
                                                "description": item1.description,
                                                "title": item1.title,
                                                "start": kendo.parseDate(moment(item1.start).format('L LT')), //"/Date(1523511510858)/", //item1.start,
                                                "end": kendo.parseDate(moment(item1.start).add(30, 'minutes')._d), //"/Date(1523511510858)/"
                                                "isAllDay": false,
                                                "eventType": eventTypeEnum.ProfileTraining,
                                                "color": "#6CE26C",
                                                "taskListId": -1,
                                                "statusId": -1,
                                                "categoryId": -1,
                                                "priorityId": -1,
                                                "isDone": isRecurrenceDone.length > 0 ? true : false,
                                                "isParticipant": item.isParticipant,
                                                "participantName": item.participantName,
                                                "isEvaluator": item.isEvaluator,
                                                "evaluatorName": item.evaluatorName,
                                                "duration": item.duration ? item.duration : 0,
                                                "durationMetric": item.durationMetricId,
                                            })
                                        }
                                        recurrence = recurrence - 1;
                                    });
                                });
                                var today = new Date();
                                today = today.setHours(0, 0, 0, 0);
                                $scope.events = [];
                                $scope.tasks = [];
                                _.filter(ds, function (item) {
                                    var itemStartDateTime = _.clone(item.start);
                                    if (kendo.parseDate(itemStartDateTime).setHours(0, 0, 0, 0) > today) {
                                        $scope.events.push(item);
                                    }
                                    else if (kendo.parseDate(itemStartDateTime).setHours(0, 0, 0, 0) == today) {
                                        $scope.tasks.push(item);
                                    }
                                });
                                $scope.trainingDiaryViewChanged();
                            });
                        }
                        else {
                            dialogService.showNotification($translate.instant('TRAININGDAIRY_TASK_ACTIVITY_NOT_SAVED'), "error");
                        }
                    });
                }
            }
            $scope.backToProjectTraining = function () {
                $(".todo-project-list li").removeClass("active");
                $scope.activeTraining = { id: 0, name: "", description: "", priority: "" };
                $scope.isPassedTrainingView = false;
                LoadTrainings();
            }
            $scope.isAllowedToAddNote = function (eventType, trainingId) {
                if (trainingId > 0) {
                    if (eventType == eventTypeEnum.ProfileTraining) {
                        return true;
                    }
                }
            }
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
                if (eventType == eventTypeEnum.ProfileTraining || eventType == eventTypeEnum.EvaluateParticipantTraining) {
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
                                        "eventType": eventTypeEnum.ProfileTraining,
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
                                            "eventType": eventTypeEnum.ProfileTraining,
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
                else if (eventType == eventTypeEnum.Task) {
                    if (id > 0) {
                        trainingdiaryManager.getTaskDetailById(id).then(function (item) {
                            var event = new kendo.data.SchedulerEvent({
                                id: item.id,
                                title: item.title,
                                start: kendo.parseDate(item.startDate), //item1.start,
                                end: kendo.parseDate(item.dueDate),
                                recurrenceRule: item.recurrenceRule,
                                eventType: item.eventType,
                            });
                            var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                            var recurrenceHistory = [];
                            var recurrence = -1;
                            angular.forEach(occurrences, function (item1, index1) {
                                var isRecurrenceDone = _.filter(item.taskActivities, function (itemActivities) {
                                    return itemActivities.taskId == item.id && kendo.parseDate(itemActivities.recurrenceStartTime).getTime() == item1.start.getTime();
                                });
                                var endTime = moment(kendo.parseDate(item1.start)).endOf("day")._d;
                                if (occurrences[index1 + 1]) {
                                    recurrenceHistory.push({
                                        "orginalId": item.id,
                                        "id": recurrence,
                                        "title": item1.title,
                                        "start": item1.start, //"/Date(1523511510858)/", //item1.start,
                                        "end": endTime, //"/Date(1523511510858)/"
                                        "eventType": eventTypeEnum.Task,
                                        "isDone": isRecurrenceDone.length > 0 ? true : false,
                                        "activityDateTime": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].activityDateTime : ''
                                    });
                                }
                                else {
                                    if (endTime.getTime() > kendo.parseDate(item.dueDate).getTime()) {
                                        endTime = moment(kendo.parseDate(item.dueDate))._d;
                                    }
                                    if (item1.start.getTime() != endTime.getTime()) {
                                        recurrenceHistory.push({
                                            "orginalId": item.id,
                                            "id": recurrence,
                                            "title": item1.title,
                                            "start": item1.start, //"/Date(1523511510858)/", //item1.start,
                                            "end": endTime, //"/Date(1523511510858)/"
                                            "eventType": eventTypeEnum.Task,
                                            "isDone": isRecurrenceDone.length > 0 ? true : false,
                                            "activityDateTime": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].activityDateTime : ''
                                        });
                                    }
                                }
                                recurrence = recurrence - 1;
                            });
                            var columns = [
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
                                    field: "activityDateTime", title: $translate.instant('COMMON_COMPLETED_TIME'), template: function (dataItem) {
                                        if (dataItem.activityDateTime) {
                                            return moment(kendo.parseDate(dataItem.activityDateTime)).format('L LT');
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                },
                                {
                                    field: "isDone", title: $translate.instant('COMMON_STATUS'), template: function (dataItem) {
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
                                                    return trainingStatus.Active;
                                                }
                                                else {
                                                    return trainingStatus.Expired;
                                                }
                                            }
                                        }
                                    }
                                },
                            ];
                            dialogService.showGridDialog($translate.instant('TRAININGDAIRY_TASK_ACTIVITIES') + " - " + title, recurrenceHistory, columns);
                        })
                    }
                    else {
                        $scope.editingTraining = null;
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_YOU_CAN_NOT_OPEN') + $translate.instant('TRAININGDAIRY_FREE_TEXT') + $translate.instant('COMMON_TRAINING'), "info");
                    }
                }
            }
            $scope.viewEvaluatorFeedbacks = function (title, eventType, id) {
                if (eventType == eventTypeEnum.ProfileTraining || eventType == eventTypeEnum.EvaluateParticipantTraining) {
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
                                        return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime() && itemfeedback.isEvaluatorFeedBack == true;;
                                    }
                                });
                                if (isRecurrenceDone.length > 0) {
                                    var endTime = moment(kendo.parseDate(item1.start)).endOf("day")._d;
                                    if (occurrences[index1 + 1]) {
                                        recurrenceHistory.push({
                                            "orginalId": item.id,
                                            "id": recurrence,
                                            "name": item1.name,
                                            "start": item1.start, //"/Date(1523511510858)/", //item1.start,
                                            "end": endTime, //"/Date(1523511510858)/"
                                            "eventType": eventTypeEnum.ProfileTraining,
                                            "isDone": isRecurrenceDone.length > 0 ? true : false,
                                            "rating": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].rating : '',
                                            "evaluatorFeedBackTime": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].evaluatorFeedBackTime : '',
                                            "workedWell": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].workedWell : '',
                                            "workedNotWell": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].workedNotWell : '',
                                            "whatNextDescription": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].whatNextDescription : ''
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
                                                "start": item1.start, //"/Date(1523511510858)/", //item1.start,
                                                "end": endTime, //"/Date(1523511510858)/"
                                                "eventType": eventTypeEnum.ProfileTraining,
                                                "isDone": isRecurrenceDone.length > 0 ? true : false,
                                                "rating": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].rating : '',
                                                "evaluatorFeedBackTime": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].evaluatorFeedBackTime : '',
                                                "workedWell": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].workedWell : '',
                                                "workedNotWell": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].workedNotWell : '',
                                                "whatNextDescription": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].whatNextDescription : ''
                                            })
                                        }
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
                                    field: "evaluatorFeedBackTime", title: $translate.instant('COMMON_FEEDBACK_TIME'), template: function (dataItem) {
                                        if (dataItem.evaluatorFeedBackTime) {
                                            return moment(kendo.parseDate(dataItem.evaluatorFeedBackTime)).format('L LT');
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
                            ];
                            var windowDiv = $('#gridDialogWindow');
                            var dialog = windowDiv.data("kendoWindow");
                            if (dialog) {
                                dialog.close();
                            }
                            dialogService.showGridDialog($translate.instant('TRAININGDAIRY_EVALUATOR_FEEDBACKS') + " - " + title, recurrenceHistory, columns);
                        })
                    }
                    else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_YOU_CAN_NOT_OPEN') + $translate.instant('TRAININGDAIRY_FREE_TEXT') + $translate.instant('COMMON_TRAINING'), "info");
                    }
                }
            }
            $scope.loadPassedProfiles = function () {
                progressBar.startProgress();
                CleanTrainingDiaryView();
                $scope.isPassedTrainingView = true;
                $scope.trainingDiaryViewId = trainingDiaryViewEnum.History;
                if (!($scope.currentUser)) {
                    var authData = localStorageService.get('authorizationData');
                    $scope.currentUser = authData;
                    $scope.currentUser.user["userKey"] = authData.user.id;
                    $scope.currentUser.user.id = authData.user.userId;
                    $scope.filter.participantId = ($scope.currentUser.user.userKey);
                    $scope.filter.organizationId = parseInt($scope.currentUser.user.organizationId);
                    organizationChanged($scope.filter.organizationId);
                }
                if ($scope.currentUser) {
                    trainingsDiaryService.getTrainigPassedProfiles($scope.currentUser.user.userKey, $scope.profileStartDate, $scope.profileEndDate).then(function (data) {
                        $scope.passedTrainingProfiles = [];
                        if (data.length > 0) {
                            $scope.passedTrainingProfiles = data;
                            $scope.activeProfile = $scope.passedTrainingProfiles[0];
                            $scope.activeProfileParticipant = "";
                            $scope.activeProfileEvaluator = "";
                            if ($scope.activeProfile.profile.evaluators.length > 0) {
                                $scope.activeProfileEvaluator = $scope.activeProfile.profile.evaluators[0].firstName + " " + $scope.activeProfile.profile.evaluators[0].lastName;
                            }
                            if ($scope.activeProfile.profile.participants.length > 0) {
                                $scope.activeProfileParticipant = $scope.activeProfile.profile.participants[0].firstName + " " + $scope.activeProfile.profile.participants[0].lastName;
                            }
                            progressBar.stopProgress();
                            $scope.trainingDiaryViewChanged();
                            LoadProfileTrainings();
                        }
                        else {
                            progressBar.stopProgress();
                        }
                    }, function (e) {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_THERE_IS_SOMETHING_WENT_WRONG'), "error");
                        progressBar.stopProgress();
                    });
                }
            };
            $scope.passedProfileChanged = function (id, element, profile) {
                $scope.isPassedTrainingView = true;
                $scope.activeTraining = { id: 0, name: "", description: "" };
                var filterProfile = _.filter($scope.passedTrainingProfiles, function (item) {
                    return item.profile.id == id;
                });
                $(".todo-project-list li").removeClass("active");
                $("#profile-list li").removeClass("active");
                if ($(element.target).is("li")) {
                    $(element.target).addClass("active")
                }
                else {
                    $(element.target).parents("li").addClass("active");
                }
                $scope.profileTrainingMaterials = [];
                if (filterProfile.length > 0) {
                    var filteredProfile = _.filter(filterProfile, function (item) {
                        return item.profile == profile;
                    })
                    if (filteredProfile.length > 0) {
                        $scope.activeProfile = filteredProfile[0];
                    }
                    else {
                        $scope.activeProfile = filterProfile[0];
                    }
                    $scope.activeProfileParticipant = "";
                    $scope.activeProfileEvaluator = "";
                    if ($scope.activeProfile.profile.evaluators.length > 0) {
                        $scope.activeProfileEvaluator = $scope.activeProfile.profile.evaluators[0].firstName + " " + $scope.activeProfile.profile.evaluators[0].lastName;
                    }
                    if ($scope.activeProfile.profile.participants.length > 0) {
                        $scope.activeProfileParticipant = $scope.activeProfile.profile.participants[0].firstName + " " + $scope.activeProfile.profile.participants[0].lastName;
                    }
                    LoadProfileTrainings();
                    console.log("passedProfileChanged");
                    $("[data-target='#tab_diary']").click();
                    $scope.TabChange("diary");
                }
            }
            $scope.profileStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    max: moment().set({ hour: 0, minute: -1, seconds: 0, milliseconds: 0 })._d
                });
            };
            $scope.profileStartDateChange = function () {
                if (!(kendo.parseDate($scope.profileStartDate) < kendo.parseDate($scope.profileEndDate))) {
                    $scope.profileEndDate = "";
                }
            };
            $scope.profileEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                if ($scope.profileStartDate) {
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.profileStartDate),
                        max: moment().set({ hour: 0, minute: -1, seconds: 0, milliseconds: 0 })._d
                    });
                }
                else {
                    datepicker.setOptions({
                        max: moment().set({ hour: 0, minute: -1, seconds: 0, milliseconds: 0 })._d
                    });
                }
            };
            $scope.trainingDiaryViewStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    max: moment().set({ hour: 0, minute: -1, seconds: 0, milliseconds: 0 })._d
                });
            };
            $scope.trainingDiaryViewStartDateChange = function () {
                if (!(kendo.parseDate($scope.trainingDiaryViewStartDate) < kendo.parseDate($scope.trainingDiaryViewEndDate))) {
                    $scope.trainingDiaryViewEndDate = "";
                }
            };
            $scope.trainingDiaryViewEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                if ($scope.trainingDiaryViewStartDate) {
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.trainingDiaryViewStartDate),
                        max: moment().set({ hour: 0, minute: -1, seconds: 0, milliseconds: 0 })._d
                    });
                }
                else {
                    datepicker.setOptions({
                        max: moment().set({ hour: 0, minute: -1, seconds: 0, milliseconds: 0 })._d
                    });
                }
            };
            $scope.isParticipantProfile = function (profile) {
                if (profile) {
                    if (profile.participants.length > 0) {
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
            $scope.loadHistoryTraining = function () {
                var ds = new kendo.data.ObservableArray([]);
                var ipsCalenderEventFilterModel = {
                    userId: $scope.currentUser.user.id,
                    startDate: null,
                    endDate: null
                };
                if ($scope.trainingDiaryViewId == trainingDiaryViewEnum.History) {
                    ipsCalenderEventFilterModel.startDate = kendo.parseDate($scope.trainingDiaryViewStartDate);
                    ipsCalenderEventFilterModel.endDate = kendo.parseDate($scope.trainingDiaryViewEndDate);
                }
                trainingsDiaryService.getEventsByUserId(ipsCalenderEventFilterModel).then(function (data) {
                    angular.forEach(data, function (item, index) {
                        var event = new kendo.data.SchedulerEvent({
                            id: item.id,
                            description: item.description,
                            title: item.title,
                            start: kendo.parseDate(item.start), //item1.start,
                            end: kendo.parseDate(item.end),
                            recurrenceRule: item.recurrenceRule,
                            eventType: item.eventType,
                            isAllDay: moment(item.start).format("HHmmss") == "000000",
                            color: item.eventType == eventTypeEnum.Task ? "#F6B94D" : "#C94D09",
                            taskListId: taskList ? taskList.id : 0,
                            statusId: item.statusId,
                            categoryId: item.categoryId,
                            priorityId: item.priorityId,
                            evaluatorFeedback: null
                        });
                        var occurrences = event.expand(kendo.parseDate(item.start), kendo.parseDate(item.end));
                        var recurrence = -1;
                        angular.forEach(occurrences, function (item1, index1) {
                            var isRecurrenceDone = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                if (item.eventType == eventTypeEnum.Task) {
                                    if (itemfeedback.recurrencesStartTime) {
                                        return itemfeedback.taskId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime();
                                    }
                                }
                                else {
                                    if (itemfeedback.recurrencesStartTime) {
                                        return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime();
                                    }
                                }
                            });
                            var startedAt = null;
                            var endedAt = null;
                            if (isRecurrenceDone.length > 0) {
                                var ascRecurrenceDone = _.sortByOrder(isRecurrenceDone, function (o) { return new moment(kendo.parseDate(o.startedAt)).format('L LT'); }, ['asc']);
                                startedAt = ascRecurrenceDone[0].startedAt;
                                endedAt = ascRecurrenceDone[ascRecurrenceDone.length - 1].feedbackDateTime;
                            }
                            var evaluatorFeedback = null;
                            if (item1.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                evaluatorFeedback = _.find(item.trainingFeedbacks, function (itemfeedback) {
                                    if (itemfeedback.recurrencesStartTime) {
                                        return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime() && itemfeedback.evaluatorId == $scope.currentUser.user.id;
                                    }
                                });
                            }
                            var endTime = moment(kendo.parseDate(item1.start)).endOf("day")._d;
                            if (!(occurrences[index1 + 1])) {
                                if (endTime.getTime() > kendo.parseDate(item.end).getTime()) {
                                    endTime = moment(kendo.parseDate(item.end))._d;
                                }
                                if (item1.start.getTime() != endTime.getTime()) {
                                    ds.push({
                                        "orginalId": item.id,
                                        "id": recurrence,
                                        "description": item1.description,
                                        "title": item1.title,
                                        "start": kendo.parseDate(item1.start), //"/Date(1523511510858)/", //item1.start,
                                        "end": endTime, //"/Date(1523511510858)/"
                                        "isAllDay": false,
                                        "eventType": item1.eventType,
                                        "color": item.eventType == eventTypeEnum.Task ? "#F6B94D" : "#C94D09",
                                        "taskListId": taskList ? taskList.id : 0,
                                        "statusId": item.statusId,
                                        "categoryId": item.categoryId,
                                        "priorityId": item.priorityId,
                                        "recurrencesRule": item.recurrenceRule,
                                        "isDone": isRecurrenceDone.length > 0 ? true : false,
                                        "startedAt": isRecurrenceDone.length > 0 ? startedAt : null,
                                        "endedAt": isRecurrenceDone.length > 0 ? endedAt : null,
                                        "evaluatorFeedback": evaluatorFeedback,
                                        "duration": item.duration ? item.duration : 0,
                                        "durationMetric": item.durationMetricId
                                    });
                                }
                            }
                            else {
                                ds.push({
                                    "orginalId": item.id,
                                    "id": recurrence,
                                    "description": item1.description,
                                    "title": item1.title,
                                    "start": kendo.parseDate(item1.start), //"/Date(1523511510858)/", //item1.start,
                                    "end": endTime, //"/Date(1523511510858)/"
                                    "isAllDay": false,
                                    "eventType": item1.eventType,
                                    "color": item.eventType == eventTypeEnum.Task ? "#F6B94D" : "#C94D09",
                                    "taskListId": taskList ? taskList.id : 0,
                                    "statusId": item.statusId,
                                    "categoryId": item.categoryId,
                                    "priorityId": item.priorityId,
                                    "recurrencesRule": item.recurrenceRule,
                                    "isDone": isRecurrenceDone.length > 0 ? true : false,
                                    "startedAt": isRecurrenceDone.length > 0 ? startedAt : null,
                                    "endedAt": isRecurrenceDone.length > 0 ? endedAt : null,
                                    "evaluatorFeedback": evaluatorFeedback,
                                    "duration": item.duration ? item.duration : 0,
                                    "durationMetric": item.durationMetricId
                                });
                            }
                            recurrence = recurrence - 1;
                        });
                    });
                    // Profile Trainings
                    angular.forEach($scope.profileTrainings, function (item, index) {
                        var event = new kendo.data.SchedulerEvent({
                            id: item.id,
                            description: item.additionalInfo,
                            title: item.name,
                            start: kendo.parseDate(item.startDate), //item1.start,
                            end: kendo.parseDate(item.endDate),
                            recurrenceRule: item.frequency,
                            eventType: eventTypeEnum.ProfileTraining,
                            isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                            color: "#6CE26C",
                            taskListId: -1,
                            statusId: -1,
                            categoryId: -1,
                            priorityId: -1,
                            isParticipant: item.isParticipant,
                            evaluatorFeedback: null,
                            participantName: item.participantName,
                            isEvaluator: item.isEvaluator,
                            evaluatorName: item.evaluatorName,
                        });
                        var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.endDate));
                        var recurrence = -1;
                        angular.forEach(occurrences, function (item1, index1) {
                            var isRecurrenceDone = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                if (itemfeedback.recurrencesStartTime) {
                                    return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime();
                                }
                            });
                            var evaluatorFeedback = null;
                            if (item1.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                evaluatorFeedback = _.find(item.trainingFeedbacks, function (itemfeedback) {
                                    if (itemfeedback.recurrencesStartTime) {
                                        return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime() && itemfeedback.evaluatorId == $scope.currentUser.user.id;
                                    }
                                });
                            }
                            var startedAt = null;
                            var endedAt = null;
                            var timeSpent = 0;
                            var timePlanned = 0;
                            if (isRecurrenceDone.length > 0) {
                                var ascRecurrenceDone = _.sortByOrder(isRecurrenceDone, function (o) { return new moment(kendo.parseDate(o.startedAt)).format('L LT'); }, ['asc']);
                                startedAt = ascRecurrenceDone[0].startedAt;
                                endedAt = ascRecurrenceDone[ascRecurrenceDone.length - 1].feedbackDateTime;
                                if (item.durationMetricId == 1) {
                                    //Hour
                                    timePlanned += (item.duration * 60);
                                }
                                if (item.durationMetricId == 3) {
                                    //Minutes
                                    timePlanned += (item.duration);
                                }
                                if (item.durationMetricId == 4) {
                                    //Seconds
                                    timePlanned += (item.duration / 60);
                                }
                                if (item.durationMetricId == 5) {
                                    //Days
                                    timePlanned += (item.duration * 1440);
                                }
                                _.each(ascRecurrenceDone, function (ascRecurrenceItem) {
                                    timeSpent += ascRecurrenceItem.timeSpentMinutes;
                                });
                            }
                            var endTime = moment(kendo.parseDate(item1.start)).endOf("day")._d;
                            if (!(occurrences[index1 + 1])) {
                                if (endTime.getTime() > kendo.parseDate(item.endDate).getTime()) {
                                    endTime = moment(kendo.parseDate(item.endDate))._d;
                                }
                                if (item1.start.getTime() != endTime.getTime()) {
                                    ds.push({
                                        "orginalId": item.id,
                                        "id": recurrence,
                                        "description": item1.description,
                                        "title": item1.title,
                                        "start": kendo.parseDate(item1.start), //"/Date(1523511510858)/", //item1.start,
                                        "end": endTime, //"/Date(1523511510858)/"
                                        "isAllDay": false,
                                        "eventType": eventTypeEnum.ProfileTraining,
                                        "color": "#6CE26C",
                                        "taskListId": -1,
                                        "statusId": -1,
                                        "categoryId": -1,
                                        "priorityId": -1,
                                        "isDone": isRecurrenceDone.length > 0 ? true : false,
                                        "startedAt": isRecurrenceDone.length > 0 ? startedAt : null,
                                        "endedAt": isRecurrenceDone.length > 0 ? endedAt : null,
                                        "timeSpent": timeSpent,
                                        "timePlanned": timePlanned,
                                        "isParticipant": item.isParticipant,
                                        "participantName": item.participantName,
                                        "isEvaluator": item.isEvaluator,
                                        "evaluatorName": item.evaluatorName,
                                        "evaluatorFeedback": evaluatorFeedback,
                                        "duration": item.duration ? item.duration : 0,
                                        "durationMetric": item.durationMetricId,
                                    })
                                }
                            }
                            else {
                                ds.push({
                                    "orginalId": item.id,
                                    "id": recurrence,
                                    "description": item1.description,
                                    "title": item1.title,
                                    "start": kendo.parseDate(item1.start), //"/Date(1523511510858)/", //item1.start,
                                    "end": endTime, //"/Date(1523511510858)/"
                                    "isAllDay": false,
                                    "eventType": eventTypeEnum.ProfileTraining,
                                    "color": "#6CE26C",
                                    "taskListId": -1,
                                    "statusId": -1,
                                    "categoryId": -1,
                                    "priorityId": -1,
                                    "isDone": isRecurrenceDone.length > 0 ? true : false,
                                    "startedAt": isRecurrenceDone.length > 0 ? startedAt : null,
                                    "endedAt": isRecurrenceDone.length > 0 ? endedAt : null,
                                    "timeSpent": timeSpent,
                                    "timePlanned": timePlanned,
                                    "isParticipant": item.isParticipant,
                                    "participantName": item.participantName,
                                    "isEvaluator": item.isEvaluator,
                                    "evaluatorName": item.evaluatorName,
                                    "evaluatorFeedback": evaluatorFeedback,
                                    "duration": item.duration ? item.duration : 0,
                                    "durationMetric": item.durationMetricId,
                                })
                            }
                            recurrence = recurrence - 1;
                        });
                    });
                    var today = new Date();
                    today = today.setHours(0, 0, 0, 0);
                    $scope.events = [];
                    $scope.tasks = [];
                    var isParticipantActiveProfile = false;
                    if ($scope.activeProfile) {
                        isParticipantActiveProfile = $scope.isParticipantProfile($scope.activeProfile.profile);
                    }
                    _.filter(ds, function (item) {
                        if ($scope.isPassedTrainingView) {
                            if (isParticipantActiveProfile) {
                                item["role"] = "Participant";
                                item["user"] = $scope.activeProfileParticipant;
                                $scope.events.push(item);
                            }
                            else {
                                if (item.isParticipant) {
                                    item["role"] = "Participant";
                                    item["user"] = $scope.activeProfileParticipant;
                                }
                                else {
                                    if (item.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                        item["role"] = "Evaluator";
                                        if ($scope.activeProfileEvaluator) {
                                            item["user"] = $scope.activeProfileEvaluator;
                                        }
                                        else {
                                            item["user"] = "Participant";
                                        }
                                    }
                                    else {
                                        item["role"] = "Participant";
                                        item["user"] = $scope.currentUser.user.firstName + " " + $scope.currentUser.user.lastName;
                                    }
                                }
                                $scope.events.push(item);
                            }
                        }
                        else {
                            var itemStartDateTime = _.clone(item.start);
                            if (kendo.parseDate(itemStartDateTime).setHours(0, 0, 0, 0) < today) {
                                if (isParticipantActiveProfile) {
                                    item["role"] = "Participant";
                                    item["user"] = $scope.activeProfileParticipant;
                                    $scope.events.push(item);
                                }
                                else {
                                    if (item.isParticipant) {
                                        item["role"] = "Participant";
                                        item["user"] = $scope.activeProfileParticipant;
                                    } else {
                                        if (item.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                            item["role"] = "Evaluator";
                                            if ($scope.activeProfileEvaluator) {
                                                item["user"] = $scope.activeProfileEvaluator;
                                            }
                                            else {
                                                item["user"] = "";
                                            }
                                        }
                                        else {
                                            item["role"] = "";
                                            item["user"] = $scope.currentUser.user.firstName + " " + $scope.currentUser.user.lastName;
                                        }
                                    }
                                    $scope.events.push(item);
                                }
                            }
                            else if (kendo.parseDate(itemStartDateTime).setHours(0, 0, 0, 0) == today) {
                                if (isParticipantActiveProfile) {
                                    if (item.isParticipant) {
                                        item["role"] = "Participant";
                                        item["user"] = $scope.activeProfileParticipant;
                                        $scope.tasks.push(item);
                                    }
                                }
                                else {
                                    if (item.isParticipant) {
                                        item["role"] = "Participant";
                                        item["user"] = $scope.activeProfileParticipant;
                                    } else {
                                        if (item.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                            item["role"] = "Evaluator";
                                            if ($scope.activeProfileEvaluator) {
                                                item["user"] = $scope.activeProfileEvaluator;
                                            }
                                            else {
                                                item["user"] = "";
                                            }
                                        }
                                        else {
                                            item["role"] = "";
                                            item["user"] = $scope.currentUser.user.firstName + " " + $scope.currentUser.user.lastName;
                                        }
                                    }
                                    $scope.tasks.push(item);
                                }
                            }
                        }
                    });
                    if ($scope.trainingDiaryViewId == trainingDiaryViewEnum.History) {
                        $("#userStatsHistoryTasksGrid").kendoGrid({
                            dataBound: $scope.onUserAssignGridDataBound,
                            dataSource: {
                                data: $scope.events,
                                pageSize: 10,
                                group: { field: "orginalId", field: "title" },
                            },
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
                            resizable: true,
                            columns: [
                                {
                                    field: "title", title: $translate.instant('COMMON_TITLE'), width: "120px",
                                },
                                {
                                    field: "start",
                                    title: $translate.instant('COMMON_RECURRENCE_START'),
                                    width: "200px",
                                    template: function (data, value) {
                                        return moment(kendo.parseDate(data.start)).format('L LT')
                                    }
                                },
                                {
                                    field: "end",
                                    title: $translate.instant('COMMON_RECURRENCE_END'),
                                    width: "200px",
                                    template: function (data, value) {
                                        return moment(kendo.parseDate(data.end)).format('L LT')
                                    }
                                },
                                {
                                    field: "startedAt",
                                    title: $translate.instant('COMMON_TRAINING_STARTED'),
                                    width: "200px",
                                    template: function (dataItem) {
                                        if (dataItem.startedAt) {
                                            return moment(kendo.parseDate(dataItem.startedAt)).format('L LT');
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                },
                                {
                                    field: "endedAt",
                                    title: $translate.instant('COMMON_TRAINING_ENDED'),
                                    width: "200px",
                                    template: function (dataItem) {
                                        if (dataItem.endedAt) {
                                            return moment(kendo.parseDate(dataItem.endedAt)).format('L LT');
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                },
                                {
                                    field: "timeSpent",
                                    title: $translate.instant('COMMON_TIME_SPENT'),
                                    width: "150px",
                                },
                                {
                                    field: "timePlanned",
                                    title: $translate.instant('COMMON_TIME_PLANNED'),
                                    width: "180px",
                                },
                                {
                                    field: "timePlanned",
                                    title: $translate.instant('TASKPROSPECTING_RESULT'), template: function (dataItem) {
                                        if (dataItem.timePlanned != 0) {
                                            if (dataItem.timeSpent >= dataItem.timePlanned) {
                                                return "<i class='fa fa-smile-o'></i>"
                                            }
                                            else {
                                                return "<i class='fa fa-frown-o'></i>"
                                            }
                                        }
                                        else {
                                            return "<i class='fa fa-meh-o'></i>"
                                        }
                                    },
                                    width: "120px",
                                },
                                {
                                    field: "isDone",
                                    title: $translate.instant('COMMON_STATUS'),
                                    width: "120px",
                                    template: function (dataItem) {
                                        if (dataItem.isDone) {
                                            return "Done";
                                        }
                                        else {
                                            return "Not Done";
                                        }
                                    }
                                },
                                {
                                    field: "eventType",
                                    title: $translate.instant('COMMON_EVENT_TYPE'),
                                    width: "150px",
                                    template: function (data, value) {
                                        if (data.eventType == eventTypeEnum.Task) {
                                            return 'Task';
                                        }
                                        
                                        else if (data.eventType == eventTypeEnum.ProfileTraining) {
                                            return 'Profile Training';
                                        }
                                        else if (data.eventType == eventTypeEnum.EvaluateParticipantTraining) {
                                            return 'Evaluate Participant Training';
                                        }
                                    }
                                },
                                {
                                    field: "role",
                                    title: $translate.instant('COMMON_ROLE'),
                                    width: "110px",
                                },
                                {
                                    field: "user",
                                    title: $translate.instant('COMMON_USER'),
                                },
                                {
                                    field: "orginalId", title: $translate.instant('COMMON_ACTION'), width: "150px", filterable: false, sortable: false, template: function (data) {
                                        var result = '<div class="icon-groups"><a class="fa fa-eye fa-lg" title="View Detail" href="javascript:;" ng-click="openAgendaDetail(' + data.eventType + ',' + data.orginalId + ',$event)"></a> ';
                                        result += "<a href='javascript:;' class='fa fa-plus-square fa-lg' title='Add New Training Note' ng-show='isAllowedToAddNote(" + data.eventType + "," + data.orginalId + ")' ng-click='addTrainingNote(" + data.orginalId + ")'></a>";
                                        result += "<a href='javascript:;' class='fa fa-outdent fa-lg' title='All Training Notes' ng-show='hasTrainingNotes(" + data.orginalId + ")' ng-click='viewTrainingNotes(\"" + data.title + "\"," + data.orginalId + ")'></a>";
                                        if ($scope.isPassedTrainingView) {
                                            result += "<a href='javascript:;' class='fa fa-list fa-lg' title='History' ng-click='viewHistory(\"" + data.title + "\"," + data.eventType + "," + data.orginalId + ")'></a>";
                                        }
                                        if (data.evaluatorFeedback) {
                                            if (data.evaluatorFeedback.evaluatorFeedBackTime == null) {
                                                result += "<a href='javascript:;' class='fa fa-list fa-lg' title='Submit Evaluator Feedback' ng-click='evaluateTraining(\"" + data.evaluatorFeedback.id + "\"," + data.orginalId + ",\"" + data.title + "\")'></a>";
                                            }
                                            else {
                                                result += "<a href='javascript:;' class='fa fa-list fa-lg' title='View Evaluator Feedback' ng-click='viewEvaluatorFeedbacks(\"" + data.title + "\"," + data.eventType + "," + data.orginalId + ")'></a>";
                                            }
                                        }
                                        result += "</div>";
                                        return result;
                                    }
                                },
                            ],
                        });
                        $("#userStatsHistoryTasksGrid").kendoTooltip({
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
                        $compile($("#userStatsHistoryTasksGrid"))($scope);
                    }
                });
            }
            $scope.backToProjectTraining();
            $scope.evaluateTraining = function (feedbackId, trainingId, title) {
                $location.path("/home/training/evaluate/" + trainingId + "/" + feedbackId);
            }
            $scope.trainingHourPerformance = function (spent, total) {
                if (total != 0) {
                    if (spent >= total) {
                        return "fa-smile-o"
                    }
                    else {
                        return "fa-frown-o"
                    }
                }
                else {
                    return "fa-meh-o"
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
            $scope.summaryFor = "Profile";
            $scope.filterTrainingSummary = function (option) {
                $scope.summaryFor = option;
            }
            $scope.filterType = $translate.instant('TRAININGDAIRY_ALL_AGREEGATE');//"All Aggregate";
            $scope.changeFilterTrainingType = function (view) {
                $scope.filterType = view;

                if (view == "All Aggregate" || view == 'Own Aggregate') {
                    $scope.updateSpentTimeCalculation();
                }
                else if (view == "Selected Profile") {
                    $scope.selectedProfileTimeCalculation();
                    $scope.filterTrainingSummary("Profile");
                }

            }
            $scope.trainingHourResult = function (spent, total) {
                if (total) {
                    if (total != 0) {
                        return Math.abs(spent - total);
                    }
                    else {
                        return "0";
                    }
                }
                else {
                    return "0";
                }
            }
            $scope.isTrainingTargetPending = function (spent, total) {
                if (total) {
                    if (spent >= total) {
                        return "fa-plus";
                    }
                    else {
                        return "fa-minus";
                    }
                }
            }
            function scheduler_navigate(e) {
                //Reference to the parent element.
                if (e.view == "agenda") {
                    setTimeout(function () {
                        $compile($("#tdcalendar"))($scope);
                    }, 100);
                }
            }
            function myOpenEventHandler(e) {
                //e.preventDefault();
            }
            function myCloseEventHandler(e) {
                //e.preventDefault();
            }
            function sendSuccess(result) {
                if (result.data) {
                    dialogService.showNotification($translate.instant('TRAININGDAIRY_MAIL_HAS_BEEN_SENT_TO_EVALUATOR'), "success");
                }
                else {
                    dialogService.showNotification($translate.instant('TRAININGDAIRY_REMINDER_NOTIFICATION_SENDING_FAILED'), "error");
                }
            }
            function sendError(result) {
                dialogService.showNotification($translate.instant('TRAININGDAIRY_REMINDER_NOTIFICATION_SENDING_FAILED'));
            }
            function taskParticipantChanged() {
                var selected = this.value();
                var participantValue = $("select[data-bind='value:participantId']").getKendoDropDownList().value();
                if (participantValue != "") {
                    if (participantValue == selected) {
                        $("select[data-bind='value:participantId']").getKendoDropDownList().value("");
                    };
                }
            }
            function inviteDropDownChanged() {
                var participantValue = $("select[data-bind='value:userId']").getKendoDropDownList().value();
                var selected = this.value();
                if (participantValue != "") {
                    if (participantValue == selected) {
                        this.value("");
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_YOU_CAN_NOT_SELECT_SAME_INVITE_WITH_SELECTED_PARTICIPANT'), "error");
                    };
                }
            }
            function organizationChanged(id) {
                CleanTrainingDiaryView();
                if (id > 0) {
                    trainingdiaryManager.getOrganizationParticipants(id).then(function (data) {
                        $scope.participnats = data;
                    });
                }
                else {
                    $scope.filter.participantId = "";
                }
            }
            function getParameterByName(url, name) {
                var match = RegExp('[?&]' + name + '=([^&]*)').exec(url);
                return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
            }
            function getselectedTraining(agreementId, trainingId) {
                var result = null;
                _.forEach($scope.activeProfile.ipsTrainingDiaryStages, function (ipsTrainingDiaryStage) {
                    _.forEach(ipsTrainingDiaryStage.evaluationAgreement, function (evaluationAgreement) {
                        if (evaluationAgreement.id == agreementId) {
                            $scope.activeKPIType = evaluationAgreement.kpiType;
                            _.forEach(evaluationAgreement.trainings, function (training) {
                                if (training.id == trainingId) {
                                    $scope.activeStage = ipsTrainingDiaryStage;
                                    result = training;
                                }
                            })
                        }
                    })
                });
                return result;
            }
            function LoadTrainings() {
                $scope.isPassedTrainingView = false;
                $scope.passedTrainingProfiles = [];
                $scope.profileStartDate = "";
                $scope.profileEndDate = "";
                progressBar.startProgress();
                CleanTrainingDiaryView();
                if (!($scope.currentUser)) {
                    var authData = localStorageService.get('authorizationData');
                    $scope.currentUser = authData;
                    $scope.currentUser.user["userKey"] = authData.user.id;
                    $scope.currentUser.user.id = authData.user.userId;
                    $scope.filter.participantId = ($scope.currentUser.user.userKey);
                    $scope.filter.organizationId = parseInt($scope.currentUser.user.organizationId);
                    organizationChanged($scope.filter.organizationId);
                }
                if ($scope.currentUser) {
                    trainingdiaryManager.getTrainigActiveProfiles($scope.currentUser.user.userKey).then(function (data) {
                        $scope.trainingProfiles = [];
                        if (data.length > 0) {
                            $scope.trainingProfiles = data;
                            $scope.activeProfile = $scope.trainingProfiles[0];
                            $scope.activeProfileParticipant = "";
                            $scope.activeProfileEvaluator = "";
                            if ($scope.activeProfile.profile.evaluators.length > 0) {
                                $scope.activeProfileEvaluator = $scope.activeProfile.profile.evaluators[0].firstName + " " + $scope.activeProfile.profile.evaluators[0].lastName;
                            }
                            if ($scope.activeProfile.profile.participants.length > 0) {
                                $scope.activeProfileParticipant = $scope.activeProfile.profile.participants[0].firstName + " " + $scope.activeProfile.profile.participants[0].lastName;
                            }
                            App.initSlimScroll(".scroller");
                            progressBar.stopProgress();
                            LoadProfileTrainings();
                        }
                        else {
                            progressBar.stopProgress();
                        }
                    }, function (e) {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_THERE_IS_SOMETHING_WENT_WRONG'), "error");
                        progressBar.stopProgress();
                    });
                   
                }
            }
            function LoadProfileTrainings() {
                progressBar.startProgress();
                var userId = $scope.activeProfile.profile.participantUserId > 0 ? $scope.activeProfile.profile.participantUserId : $scope.currentUser.user.id;
                trainingdiaryManager.getUserProfileStageTrainings(userId, $scope.activeProfile.profile.id).then(function (data) {
                    if (data.length > 0) {
                        var activeProfile = data[0];
                        if (activeProfile.ipsTrainingDiaryStages) {
                            $scope.activeProfile.ipsTrainingDiaryStages = activeProfile.ipsTrainingDiaryStages;
                            if (activeProfile.ipsTrainingDiaryStages.length > 0) {
                                $scope.activeStage = activeProfile.ipsTrainingDiaryStages[0];
                            }
                        }
                        if ($scope.activeStage) {
                            if ($scope.activeStage.evaluationAgreement.length > 0) {
                                $scope.activeKPIType = $scope.activeStage.evaluationAgreement[0].kpiType;
                                if ($scope.activeStage.evaluationAgreement[0].trainings.length > 0) {
                                    $scope.activeTraining = $scope.activeStage.evaluationAgreement[0].trainings[0];
                                    $("#trainingFeedbackGrid").html("");
                                    if ($scope.activeTraining) {
                                        if (!($scope.activeTraining.trainingFeedbacks)) {
                                            $scope.activeTraining.trainingFeedbacks = [];
                                        }
                                        $("#trainingFeedbackGrid").html("");
                                        $("#trainingFeedbackGrid").kendoGrid({
                                            dataSource: {
                                                type: "json",
                                                data: $scope.activeTraining.trainingFeedbacks,
                                                pageSize: 10,
                                                sort: { field: "feedbackDateTime", dir: "desc" },
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
                                            sortable: true,
                                            columns: [
                                                {
                                                    field: "startedAt", title: $translate.instant('COMMON_TRAINING_STARTED'), width: "20%", template: function (data, value) {
                                                        if (data.startedAt) {
                                                            return moment(kendo.parseDate(data.startedAt)).format('L LT')
                                                        }
                                                        else {
                                                            return "";
                                                        }
                                                    }
                                                },
                                                {
                                                    field: "feedbackDateTime", title: $translate.instant('COMMON_TRAINING_ENDED'), width: "15%", template: function (data, value) {
                                                        return moment(kendo.parseDate(data.feedbackDateTime)).format('L LT')
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
                                                { field: "timeSpentMinutes", title: $translate.instant('COMMON_TIME_SPENT') + "(" + $translate.instant('COMMON_MINUTES') + ")", width: "20%" },
                                            ],
                                        });
                                        $("#trainingFeedbackGrid").kendoTooltip({
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
                                        console.log("LoadProfileTrainings")
                                        $("[data-target='#tab_diary']").click();
                                        $scope.TabChange("diary");
                                        progressBar.stopProgress();
                                    }
                                    else {
                                        progressBar.stopProgress();
                                    }
                                }
                            }
                        }
                        if (activeProfile.ipsTrainingDiaryStages) {
                            _.forEach(activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                                if (stageItem.evaluationAgreement) {
                                    _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                        if (evaluationAgreementItem.trainings) {
                                            _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                if (trainingItem.trainingMaterials) {
                                                    _.forEach(trainingItem.trainingMaterials, function (trainingMaterialItem) {
                                                        trainingMaterialItem["skill"] = trainingItem.skills[0].name;
                                                        trainingMaterialItem["skillDescription"] = trainingItem.skills[0].description;
                                                        if (trainingMaterialItem.resourceType != "" && trainingMaterialItem.materialType != "Link") {
                                                            var apiBaseUrl = webConfig.serviceBase;
                                                            trainingMaterialItem.link = apiBaseUrl + "api/download/trainingMaterials/" + trainingMaterialItem.name;
                                                        }
                                                        $scope.profileTrainingMaterials.push(trainingMaterialItem);
                                                    });
                                                }
                                            })
                                        }
                                    });
                                }
                            })
                        }
                        App.initSlimScroll(".scroller");
                        progressBar.stopProgress();
                    }
                    else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_THERE_IS_NO_ANY_TRAINING'), "error");
                        progressBar.stopProgress();
                    }
                }, function (e) {
                    dialogService.showNotification($translate.instant('TRAININGDAIRY_THERE_IS_SOMETHING_WENT_WRONG'), "error");
                    progressBar.stopProgress();
                });
            }
            var e = $(".theme-panel");
            $(".toggler", e).click(function () {
                $(".toggler").hide(),
                    $(".toggler-close").show(),
                    $(".theme-panel > .theme-options").show()
            });
            $(".toggler-close", e).click(function () {
                $(".toggler").show(),
                    $(".toggler-close").hide(),
                    $(".theme-panel > .theme-options").hide()
            });
            function pageloaded(l, e) {
                l.updateSinglePage(e)
            }
            function CleanTrainingDiaryView() {
                $scope.trainingProfiles = [];
                $scope.activeTraining = null;
                $scope.activeProfile = null;
                $scope.activeStage = null;
                $scope.profileTrainingMaterials = [];
                $scope.userStats = null;
                if ($("#js-grid-juicy-projects").hasClass("cbp-caption-active")) {
                    $("#js-grid-juicy-projects").cubeportfolio('destroy');
                }
                if ($("#tdcalendar").data("kendoScheduler")) {
                    $("#tdcalendar").data("kendoScheduler").destroy();
                    $("#tdcalendar").html("");
                }
                if ($("#UerStateScorecardGrid").data("kendoGrid")) {
                    $("#UerStateScorecardGrid").kendoGrid("destroy");
                    $("#UerStateScorecardGrid").html("");
                }
                $("[data-target='#tab_diary']").click();
                $scope.TabChange("diary");
            }
            function getEvaluationRole(evaluationRoleId) {
                switch (evaluationRoleId) {
                    case 1:
                        return 'Evaluator';
                        break;
                    case 2:
                        return 'Participant';
                        break;
                    default:
                        return '';
                }
            }
            function getParticipantOrEvaluator(profileObj) {
                var result = "";
                if (profileObj.participants.length > 0) {
                    result += "Participant : ";
                }
                _.each(profileObj.participants, function (item) {
                    result += item.firstName + " " + item.lastName;
                });
                if (profileObj.evaluators.length > 0) {
                    result += "Evaluators : ";
                }
                _.each(profileObj.evaluators, function (item) {
                    result += item.firstName + " " + item.lastName;
                });
                return result;
            }
            function roleFilter(element) {
                element.kendoDropDownList({
                    dataSource: [
                        { name: "Participant", value: "Participant" },
                        { name: "Evaluator", value: "Evaluator" }
                    ],
                    dataTextField: "name",
                    dataValueField: "value"
                })
            }
        }]);