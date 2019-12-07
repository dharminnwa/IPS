angular.module('ips.starttraining')
.directive('trainingMaterialPopup', ['$compile', '$sce', function ($compile, $sce) {
    return {
        restrict: 'E',
        templateUrl: 'views/trainingDiary/directives/trainingMaterialContent.html',
        scope: {
            materialInfo: '=?',
            trainingInfo: '=?'
        },
        controller: function ($scope, $compile, $sce, apiService, dialogService, $translate) {
            $scope.ratings = [
            { value: 1, background: "#f00" },
            { value: 2, background: "#ff0" },
            { value: 3, background: "#0f3" },
            { value: 4, background: "#06f" },
            { value: 5, background: "#f99" },
            ];
            $scope.starMouseHover = function (el) {
                var onStar = parseInt($(el.target).data('value'), 10); // The star currently mouse on

                // Now highlight all the stars that's not after the current hovered star
                $(el.target).parents("#ratingStars").children('li.star').each(function (e) {
                    if (e < onStar) {
                        $(this).addClass('hover');
                    }
                    else {
                        $(this).removeClass('hover');
                    }
                });

            }
            $scope.starMouseOut = function (el) {
                $(el.target).parents("#ratingStars").children('li.star').each(function (e) {
                    $(this).removeClass('hover');
                });
            }
            $scope.submitRating = function (el) {
                var onStar = parseInt($(el.target).data('value'), 10); // The star currently selected
                var stars = $(el.target).parents("#ratingStars").children('li.star');

                for (var i = 0; i < stars.length; i++) {
                    $(stars[i]).removeClass('selected');
                }

                for (var i = 0; i < onStar; i++) {
                    $(stars[i]).addClass('selected');
                }

                var ratingValue = parseInt($('#ratingStars li.selected label').last().data('value'), 10);
                var TrainingMaterialRatingObj = {
                    id: 0,
                    trainingMaterialId: $scope.materialInfo.id,
                    rating: ratingValue,
                }
                apiService.add("trainingdiary/SubmitTrainingMaterialRating/", TrainingMaterialRatingObj).then(function (data) {
                    if (data > 0) {
                        $("[data-action='close']").click();
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_RATING_SUBMITTED_SUCCESSFULLY'), 'success');
                    }
                    else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_RATING_SUBMIT_FAILED'), 'error');
                    }
                });
            };
            $scope.materialInfo.link = $sce.trustAsResourceUrl($scope.materialInfo.link);
        }
    };
}])
.directive('trainingMaterialViewPopup', ['$compile', '$sce', function ($compile, $sce) {
        return {
            restrict: 'E',
            templateUrl: 'views/trainingDiary/directives/trainingMaterialViewContent.html',
            scope: {
                materialInfo: '=?',
                trainingInfo: '=?'
            },
            controller: function ($scope, $compile, $sce, apiService, dialogService, $translate) {
                $scope.ratings = [
                    { value: 1, background: "#f00" },
                    { value: 2, background: "#ff0" },
                    { value: 3, background: "#0f3" },
                    { value: 4, background: "#06f" },
                    { value: 5, background: "#f99" },
                ];
                $scope.starMouseHover = function (el) {
                    var onStar = parseInt($(el.target).data('value'), 10); // The star currently mouse on

                    // Now highlight all the stars that's not after the current hovered star
                    $(el.target).parents("#ratingStars").children('li.star').each(function (e) {
                        if (e < onStar) {
                            $(this).addClass('hover');
                        }
                        else {
                            $(this).removeClass('hover');
                        }
                    });

                }
                $scope.starMouseOut = function (el) {
                    $(el.target).parents("#ratingStars").children('li.star').each(function (e) {
                        $(this).removeClass('hover');
                    });
                }
                $scope.submitRating = function (el) {
                    var onStar = parseInt($(el.target).data('value'), 10); // The star currently selected
                    var stars = $(el.target).parents("#ratingStars").children('li.star');

                    for (var i = 0; i < stars.length; i++) {
                        $(stars[i]).removeClass('selected');
                    }

                    for (var i = 0; i < onStar; i++) {
                        $(stars[i]).addClass('selected');
                    }

                    var ratingValue = parseInt($('#ratingStars li.selected label').last().data('value'), 10);
                    var TrainingMaterialRatingObj = {
                        id: 0,
                        trainingMaterialId: $scope.materialInfo.id,
                        rating: ratingValue,
                    }
                    apiService.add("trainingdiary/SubmitTrainingMaterialRating/", TrainingMaterialRatingObj).then(function (data) {
                        if (data > 0) {
                            $("[data-action='close']").click();
                            dialogService.showNotification($translate.instant('TRAININGDAIRY_RATING_SUBMITTED_SUCCESSFULLY'), 'success');
                        }
                        else {
                            dialogService.showNotification($translate.instant('TRAININGDAIRY_RATING_SUBMIT_FAILED'), 'error');
                        }
                    });
                };
                $scope.materialInfo.link = $sce.trustAsResourceUrl($scope.materialInfo.link);
            }
        };
    }])
