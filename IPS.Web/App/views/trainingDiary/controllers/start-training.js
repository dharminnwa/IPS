'use strict';
angular.module('ips.starttraining')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseStartTrainingResolve = {
            pageName: function ($translate) {
                return $translate.instant('TRAININGDAIRY_START_TRAINING');
            },
            training: function ($stateParams, startTrainingService) {
                return startTrainingService.getById($stateParams.trainingId).then(function (data) {
                    return data;
                });
            }
        };
        $stateProvider
            .state('home.training.start', {
                url: "/start/:trainingId",
                templateUrl: "views/trainingDiary/views/startTraining.html",
                controller: "startTrainingCtrl as startTraining",
                resolve: baseStartTrainingResolve,
                data: {
                    displayName: '{{pageName}}',//'Start Training',
                    paneLimit: 1,
                    depth: 2
                }
            })
    }])
    .controller("startTrainingCtrl", ['$scope', 'cssInjector', '$stateParams', '$location', 'dialogService', 'localStorageService', '$compile', 'training', 'trainingdiaryManager', 'globalVariables', '$translate',
        function ($scope, cssInjector, $stateParams, $location, dialogService, localStorageService, $compile, training, trainingdiaryManager, globalVariables, $translate) {
            cssInjector.removeAll();
            //cssInjector.add('css/components.min.css');
            //cssInjector.add('css/default.min.css');
            cssInjector.add('views/trainingDiary/td-materials.css');
            cssInjector.add('views/trainingDiary/start-training.css');
            $scope.training = training;
            $scope.isStart = false;
            $scope.isTrainingPause = false;
            $scope.trainingFeedBack = {
                trainingId: 0,
                rating: 0,
                workedWell: "",
                workedNotWell: "",
                whatNextDescription: "",
                taskId: 0,
                timeSpentMinutes: 0,
            };
            $scope.trainingNote = {
                id: 0,
                trainingId: training.id,
                goal: "",
                measureInfo: "",
                proceedInfo: "",
                otherInfo: "",
            };
            $scope.ratings = [
                { value: 1, background: "#f00" },
                { value: 2, background: "#ff0" },
                { value: 3, background: "#0f3" },
                { value: 4, background: "#06f" },
                { value: 5, background: "#f99" },
            ];
            $scope.TotalMinutes = 0;
            $scope.AverageRating = 0;
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.startedAt = moment(new Date()).format('L LT');
            $scope.saveTraningFeedbackTriggered = false;
            $scope.startTimer = function () {
                $scope.isTrainingStart = true;
                localStorageService.set("isTrainingStart", $scope.isTrainingStart);
                $scope.$broadcast('timer-start');
            };
            $scope.pauseTimer = function () {
                $scope.isTrainingStart = true;
                $scope.isTrainingPause = true;
                localStorageService.set("isTrainingStart", $scope.isTrainingStart);
                $("#trainingPauseModal").modal("show");
                $scope.$broadcast('timer-stop');
            };
            $scope.stopTimer = function () {
                $scope.isTrainingStart = false;
                $scope.isTrainingPause = false;
                localStorageService.set("isTrainingStart", $scope.isTrainingStart);
                $scope.$broadcast('timer-stop');
            };
            $scope.pauseTraining = function () {
                $scope.isTrainingStart = false;
                $scope.isTrainingPause = true;
                localStorageService.set("isTrainingStart", $scope.isTrainingStart);
                $scope.$broadcast('timer-stop');

            };
            $scope.resumeTimer = function () {
                $scope.isTrainingPause = false;
                $scope.isTrainingStart = true;
                localStorageService.set("isTrainingStart", $scope.isTrainingStart);
                $scope.$broadcast('timer-resume');

            }
            $scope.init = function () {
                $scope.startTimer();

                if ($scope.training.trainingMaterials) {
                    if ($scope.training.trainingMaterials.length > 0) {
                        inittrainingMaterial();
                    }
                }
                $scope.getCounts();
            }
            $scope.trainingMaterialClass = function (type) {
                //{ { :  : material.materialType == 'Image' ? (material.name.length > 0 ? getLink(material.name) : material.link) : 'images/url.png' } }
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
            $scope.saveTraningFeedback = saveTraningFeedback;
            $scope.saveTraningNote = saveTraningNote;
            $scope.cancelTraningFeedback = cancelTraningFeedback;
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
            $scope.getCounts = function () {
                _.each(training.trainingFeedbacks, function (item) {
                    $scope.TotalMinutes += item.timeSpentMinutes;
                    $scope.AverageRating += item.rating;
                });
                $scope.AverageRating = parseFloat($scope.AverageRating / training.trainingFeedbacks.length).toFixed(1);
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
            $scope.startTrainingTabChange = function (viewName) {
                if (viewName == "Training Material") {
                    if ($("#training-material").hasClass("cbp-caption-active")) {
                        $("#training-material").cubeportfolio('destroy');
                    }
                    setTimeout(function () {
                        $("#training-material").cubeportfolio({
                            filters: "#training-material-filters",
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
                            lightboxDelegate: ".cbp-lightbox",
                            lightboxGallery: !0,
                            lightboxTitleSrc: "data-title",
                            lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
                            singlePageDelegate: ".cbp-singlePage",
                            singlePageDeeplinking: !0,
                            singlePageStickyNavigation: !0,
                            singlePageCounter: '<div class="cbp-popup-singlePage-counter">{{current}} of {{total}}</div>',
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
                                $scope.materialInfo = _.find($scope.training.trainingMaterials, function (info) {
                                    return t.id == info.id;
                                });
                                $scope.trainingInfo = training;

                                if ($scope.materialInfo) {
                                    $scope.materialInfo["skill"] = "";
                                    $scope.materialInfo["skillDescription"] = "";
                                    $scope.materialInfo.link = i;
                                    $scope.materialInfo.IsInsecureLink = IsInsecureLink;
                                    if (training.skills) {
                                        if (training.skills.length > 0) {
                                            $scope.materialInfo["skill"] = training.skills[0].name;
                                            $scope.materialInfo["skillDescription"] = training.skills[0].description;
                                        }
                                    }

                                    var compiledeHTML = $compile("<training-material-popup material-info='materialInfo' training-info='trainingInfo' ></training-material-popup>")($scope);
                                    l.updateSinglePage(compiledeHTML);
                                }
                                else {
                                    l.updateSinglePage("<div>There is something wrong!!</div>");
                                }
                            }
                        });
                    }, 100);
                }
                else if (viewName == "Activity") {
                    if ($("#training-material").hasClass("cbp-caption-active")) {
                        $("#training-material").cubeportfolio('destroy');
                    }
                }
            }
            $scope.$on('timer-stopped', function (event, data) {
                console.log('Timer Stopped - data = ', data);
                if (!$scope.isTrainingPause) {
                    $scope.trainingFeedBack = {
                        trainingId: 0,
                        rating: 0,
                        workedWell: "",
                        workedNotWell: "",
                        whatNextDescription: "",
                        taskId: 0,
                        timeSpentMinutes: 0,
                        startedAt: $scope.startedAt,
                    };
                    $scope.trainingFeedBack.timeSpentMinutes = data.minutes;
                    $scope.trainingFeedBack.timeSpentMinutes += data.hours * 60;
                    $scope.trainingFeedBack.trainingId = training.id;
                    $scope.saveTraningFeedbackTriggered = false;
                    $("#trainingFeedbackModal").modal('show');
                }
                else {
                    if (!$scope.isTrainingStart) {
                        $scope.trainingFeedBack = {
                            trainingId: 0,
                            rating: 0,
                            workedWell: "",
                            workedNotWell: "",
                            whatNextDescription: "",
                            taskId: 0,
                            timeSpentMinutes: 0,
                            isParticipantPaused: true,
                            startedAt: $scope.startedAt,
                        };
                        $scope.trainingFeedBack.timeSpentMinutes = data.minutes;
                        $scope.trainingFeedBack.timeSpentMinutes += data.hours * 60;
                        $scope.trainingFeedBack.trainingId = training.id;

                        $scope.trainingFeedBack.taskId = null;
                        var RecurrenceDetail = localStorageService.get("RecurrenceDetail");
                        if (RecurrenceDetail) {
                            moment.locale(globalVariables.lang.currentUICulture);
                            $scope.trainingFeedBack["recurrencesStartTime"] = kendo.parseDate(RecurrenceDetail.start); //RecurrenceDetail.start;
                            $scope.trainingFeedBack["recurrencesEndTime"] = kendo.parseDate(RecurrenceDetail.end); // ;
                            $scope.trainingFeedBack["isRecurrences"] = true;
                            $scope.trainingFeedBack["recurrencesRule"] = RecurrenceDetail.recurrencesRule;
                            $scope.trainingFeedBack["startedAt"] = kendo.parseDate($scope.startedAt);
                        }
                        trainingdiaryManager.saveTraningFeedback($scope.trainingFeedBack).then(function (data) {
                            if (data) {
                                $("#trainingFeedbackModal").modal('hide');
                                $scope.trainingFeedBack = {
                                    trainingId: 0,
                                    rating: 0,
                                    workedWell: "",
                                    workedNotWell: "",
                                    whatNextDescription: "",
                                    taskId: 0,
                                    timeSpentMinutes: 0,
                                    isParticipantPaused: false,
                                    startedAt: null,
                                };
                                if ($("#training-material").hasClass("cbp-caption-active")) {
                                    $("#training-material").cubeportfolio('destroy');
                                }
                                dialogService.showNotification($translate.instant('TRAININGDAIRY_YOU_HAVE_PAUSED_YOUR_TRAINING') + " " + $translate.instant('TRAININGDAIRY_COME_BACK_TO_END_YOUR_TRAINING'), "info");
                                $scope.isStart = false;
                                $scope.isTrainingPause = false;
                                setTimeout(function () {
                                    if (localStorageService.get("urlBack")) {
                                        $location.path(localStorageService.get("urlBack"));
                                    }
                                    else {
                                        $location.path("/home");
                                    }
                                    //$location.path("/home/training/trainingdiary");
                                }, 300);
                                //$location.path("/home/training/trainingdiary");
                            }
                            else {
                                dialogService.showNotification($translate.instant('TRAININGDAIRY_FEEDBACK_NOT_SAVED'), "warning");
                            }
                        });
                    }
                }

            });
            $scope.$on('timer-tick', function (event, data) {
                console.log(event, data);
                if (data.minutes) {
                    $scope.TotalMinutes = data.minutes;
                }
            });


            $scope.openViewTrainingNote = function (trainingId) {
                $("#trainingNoteModal").modal('show');
            }
            $scope.openNewTrainingNote = function (trainingId) {
                $scope.trainingNote = {
                    id: 0,
                    trainingId: trainingId,
                    goal: "",
                    measureInfo: "",
                    proceedInfo: "",
                    otherInfo: "",
                };
                $("#trainingNoteModal").modal('show');
            }
            $scope.openEditTrainingNote = function (trainingNoteId) {
                if (training.ipsTrainingNotes.length > 0) {
                    var trainingNote = _.find(training.ipsTrainingNotes, function (item) {
                        return item.id == trainingNoteId;
                    });
                    $scope.trainingNote = trainingNote;
                }
                $("#trainingNoteModal").modal('show');
            }
            function inittrainingMaterial() {

                setTimeout(function () {
                    if ($("#training-material").hasClass("cbp-caption-active")) {
                        $("#training-material").cubeportfolio('destroy');
                    }
                    setTimeout(function () {
                        $("#training-material").cubeportfolio({
                            filters: "#training-material-filters",
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
                            lightboxDelegate: ".cbp-lightbox",
                            lightboxGallery: !0,
                            lightboxTitleSrc: "data-title",
                            lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
                            singlePageDelegate: ".cbp-singlePage",
                            singlePageDeeplinking: !0,
                            singlePageStickyNavigation: !0,
                            singlePageCounter: '<div class="cbp-popup-singlePage-counter">{{current}} of {{total}}</div>',
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
                                $scope.materialInfo = _.find($scope.training.trainingMaterials, function (info) {
                                    return t.id == info.id;
                                });
                                $scope.trainingInfo = training;

                                if ($scope.materialInfo) {
                                    $scope.materialInfo["skill"] = "";
                                    $scope.materialInfo["skillDescription"] = "";
                                    $scope.materialInfo.link = i;
                                    $scope.materialInfo.IsInsecureLink = IsInsecureLink;
                                    if (training.skills) {
                                        if (training.skills.length > 0) {
                                            $scope.materialInfo["skill"] = training.skills[0].name;
                                            $scope.materialInfo["skillDescription"] = training.skills[0].description;
                                        }
                                    }

                                    var compiledeHTML = $compile("<training-material-popup material-info='materialInfo' training-info='trainingInfo' ></training-material-popup>")($scope);
                                    l.updateSinglePage(compiledeHTML);
                                }
                                else {
                                    l.updateSinglePage("<div>There is something wrong!!</div>");
                                }
                            }
                        });
                    }, 100);

                }, 100);

            }
            function saveTraningFeedback() {
                $scope.saveTraningFeedbackTriggered = true;
                $scope.trainingFeedBack.taskId = null;
                var RecurrenceDetail = localStorageService.get("RecurrenceDetail");
                if (RecurrenceDetail) {
                    moment.locale(globalVariables.lang.currentUICulture);
                    $scope.trainingFeedBack["recurrencesStartTime"] = kendo.parseDate(RecurrenceDetail.start); //RecurrenceDetail.start;
                    $scope.trainingFeedBack["recurrencesEndTime"] = kendo.parseDate(RecurrenceDetail.end); // ;
                    $scope.trainingFeedBack["isRecurrences"] = true;
                    $scope.trainingFeedBack["recurrencesRule"] = RecurrenceDetail.recurrencesRule;
                    $scope.trainingFeedBack["startedAt"] = kendo.parseDate($scope.startedAt);
                }
                trainingdiaryManager.saveTraningFeedback($scope.trainingFeedBack).then(function (data) {
                    if (data) {
                        $("#trainingFeedbackModal").modal('hide');
                        $scope.trainingFeedBack = {
                            trainingId: 0,
                            rating: 0,
                            workedWell: "",
                            workedNotWell: "",
                            whatNextDescription: "",
                            taskId: 0,
                            timeSpentMinutes: 0,
                        };
                        if ($("#training-material").hasClass("cbp-caption-active")) {
                            $("#training-material").cubeportfolio('destroy');
                        }

                        dialogService.showNotification($translate.instant('TRAININGDAIRY_FEEDBACK_SAVED_SUCCESSFULLY'), "info");
                        $scope.isStart = false;
                        $scope.isTrainingPause = false;

                        setTimeout(function () {
                            if (localStorageService.get("urlBack")) {
                                $location.path(localStorageService.get("urlBack"));
                            }
                            else {
                                $location.path("/home");
                            }
                        }, 300);

                    }
                    else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_FEEDBACK_SAVED_SUCCESSFULLY'), "warning");
                    }
                });

            }
            function cancelTraningFeedback() {
                $scope.trainingFeedBack = {
                    trainingId: 0,
                    rating: 0,
                    workedWell: "",
                    workedNotWell: "",
                    whatNextDescription: "",
                    taskId: 0,
                    timeSpentMinutes: 0,
                };
                $("#trainingFeedbackModal").modal('hide');
                $scope.resumeTimer();
                $scope.pauseTimer();
            }

            function saveTraningNote() {
                trainingdiaryManager.saveTraningNote($scope.trainingNote).then(function (data) {
                    if (data) {
                        if ($scope.trainingNote.id > 0) {
                            _.each($scope.training.ipsTrainingNotes, function (item) {
                                if (item.id == $scope.trainingNote.id) {
                                    item = data;
                                }
                            });
                        }
                        else {
                            $scope.training.ipsTrainingNotes = [];
                            $scope.training.ipsTrainingNotes.push(data);
                        }
                        $("#trainingNoteModal").modal('hide');
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_THANK_YOU_AND_GOOD_LUCK_ON_YOUR_TRAININGS'), "info");
                    }
                    else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_FAIL_TRAINING_NOTE_NOT_SAVED'), "warning");
                    }
                });
            }
            function getParameterByName(url, name) {
                var match = RegExp('[?&]' + name + '=([^&]*)').exec(url);
                return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
            }
        }])