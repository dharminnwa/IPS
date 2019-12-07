'use strict';

angular
    .module('ips.survey')

    .controller('answerCtrl', ['$scope', 'answerTypesEnum', 'materialTypeEnum', '$sce',
        function ($scope, answerTypesEnum, materialTypeEnum, $sce) {
            $scope.$sce = $sce;
            this.config = {
                preload: "none",
                tracks: [],
                theme: {
                    url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
                },
                plugins: {
                    controls: {
                        autoHide: true,
                        autoHideTime: 5000
                    }
                }
            };
            $scope.materialTypeEnum = materialTypeEnum;
            $scope.downloadFileUrl = webConfig.serviceBase + "api/download/answerMaterials";
            $scope.isNumericAnswer = function () {
                return $scope.answerType === answerTypesEnum.numeric;
            };
            $scope.isTextAnswer = function () {
                return $scope.answerType === answerTypesEnum.text;
            };
            $scope.isSingleChoiceAnswer = function () {
                return $scope.answerType === answerTypesEnum.singleChoice;
            };
            $scope.isMultipleChoiceAnswer = function () {
                return $scope.answerType === answerTypesEnum.multipleChoice;
            };
            $scope.isOrderAnswer = function () {
                return $scope.answerType === answerTypesEnum.order;
            };

            $scope.$watch('possibleAnswersBase', function (newValue, oldValue) {
                if ($scope.isSingleChoiceAnswer() || $scope.isMultipleChoiceAnswer() || $scope.isOrderAnswer()) {
                    $scope.possibleAnswers = JSON.parse(newValue);
                    if (_.isArray($scope.possibleAnswers)) {
                        $scope.possibleAnswers = _.sortByOrder($scope.possibleAnswers, ['order']);
                    }

                }
            });

            $scope.$watch('userAnswer', function (newValue, oldValue) {
                if (newValue === undefined) {
                    var userAnswer = null;
                    if ($scope.isSingleChoiceAnswer() || $scope.isMultipleChoiceAnswer() || $scope.isOrderAnswer()) {
                        if (!userAnswer) {
                            if ($scope.isMultipleChoiceAnswer()) {
                                userAnswer = [];
                            }
                            else {
                                if ($scope.isOrderAnswer()) {
                                    userAnswer = _.clone($scope.possibleAnswers);
                                }
                            }
                        }
                    }
                    $scope.userAnswer = userAnswer;
                }
            }, true);
            $scope.init = function () {
            };
        }])
    .directive('answer', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/survey/directives/answerView.html',
            scope: {
                answerType: '=type',
                possibleAnswersBase: '=possibleAnswers',
                userAnswer: '=userAnswer',
                singleChoiceRadioGroupId: '='
            },
            controller: 'answerCtrl'
        };
    }]);