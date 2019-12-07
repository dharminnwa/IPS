'use strict';
angular.module('ips.evaluatetraining')
.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    var baseEvaluateTrainingResolve = {
        pageName: function ($translate) {
            return $translate.instant('COMMON_EVALUATE_TRAINING');
        },
        training: function ($stateParams, evaluateTrainingService) {
            return evaluateTrainingService.getById($stateParams.trainingId).then(function (data) {

                if (data.trainingFeedbacks) {
                    var participantFeedbacks = _.filter(data.trainingFeedbacks, function (item) {
                        return item.id < $stateParams.evaluatorFeedbackId && item.evaluatorId == null;
                    });
                    data.trainingFeedbacks = participantFeedbacks;
                }
                return data;

            });
        },

    };
    $stateProvider
       .state('home.training.evaluate', {
           url: "/evaluate/:trainingId/:evaluatorFeedbackId",
           templateUrl: "views/trainingDiary/views/evaluateTraining.html",
           controller: "evaluateTrainingCtrl as evaluateTraining",
           resolve: baseEvaluateTrainingResolve,
           data: {
               displayName: '{{pageName}}',//'Evaluate Training',
               paneLimit: 1,
               depth: 2
           }
       })
}])
    .controller("evaluateTrainingCtrl", ['$scope', 'cssInjector', '$stateParams', '$location', 'dialogService', 'localStorageService', '$compile', 'training', 'trainingdiaryManager', '$translate',
        function ($scope, cssInjector, $stateParams, $location, dialogService, localStorageService, $compile, training, trainingdiaryManager, $translate) {
    cssInjector.removeAll();
    //cssInjector.add('css/components.min.css');
    //cssInjector.add('css/default.min.css');
    cssInjector.add('views/trainingDiary/td-materials.css');
    cssInjector.add('views/trainingDiary/evaluate-training.css');
    $scope.training = training;
    $scope.trainingFeedBack = {
        trainingId: 0,
        rating: 0,
        workedWell: "",
        workedNotWell: "",
        whatNextDescription: "",
        taskId: 0,
        timeSpentMinutes: 0,
    };
    $scope.ratings =   [
       { value: 1, background: "#f00" },
       { value: 2, background: "#ff0" },
       { value: 3, background: "#0f3" },
       { value: 4, background: "#06f" },
       { value: 5, background: "#f99" },
    ];
    $scope.TotalMinutes = 0;
    $scope.AverageRating = 0;

    $scope.init = function () {
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
    $scope.Evaluate = function () {
        $scope.trainingFeedBack = {
            trainingId: 0,
            rating: 0,
            workedWell: "",
            workedNotWell: "",
            whatNextDescription: "",
            taskId: 0,
            timeSpentMinutes: 0,
        };
        //$scope.trainingFeedBack.timeSpentMinutes = data.minutes;
        $scope.trainingFeedBack.trainingId = training.id;
        $scope.trainingFeedBack.id = $stateParams.evaluatorFeedbackId;
        $("#trainingFeedbackModal").modal('show');
    }
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

                            var compiledeHTML = $compile("<evaluate-training-material-popup material-info='materialInfo' training-info='trainingInfo' ></evaluate-training-material-popup>")($scope);
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

                            var compiledeHTML = $compile("<evaluate-training-material-popup material-info='materialInfo' training-info='trainingInfo' ></evaluate-training-material-popup>")($scope);
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
        $scope.trainingFeedBack.taskId = null;
        var RecurrenceDetail = localStorageService.get("RecurrenceDetail");
        if (RecurrenceDetail) {
            $scope.trainingFeedBack["recurrencesStartTime"] = kendo.parseDate(RecurrenceDetail.start); //RecurrenceDetail.start;
            $scope.trainingFeedBack["recurrencesEndTime"] = kendo.parseDate(RecurrenceDetail.end); // ;
            $scope.trainingFeedBack["isRecurrences"] = true;
            $scope.trainingFeedBack["recurrencesRule"] = RecurrenceDetail.recurrencesRule;
        }
        trainingdiaryManager.saveTraningFeedback($scope.trainingFeedBack).then(function (data) {
            if (data) {
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
                $("#trainingFeedbackModal").modal('hide');
                dialogService.showNotification($translate.instant('TRAININGDAIRY_FEEDBACK_SAVED_SUCCESSFULLY'), "info");
                $location.path("/home/training/trainingdiary");
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
    }
}])