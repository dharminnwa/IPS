'use strict';

angular
    .module('ips.questions')
    .constant('defaulQuestionValuesByAnswerTypeEnum', {
        numeric: {points: 1, minutesForQuestion: 2},
        text: {points: 5, minutesForQuestion: 30},
        singleChoice: {points: 1, minutesForQuestion: 2},
        multipleChoice: {points: 2, minutesForQuestion: 3},
        order: {points: 3, minutesForQuestion: 5}
    })
    .controller('correctAnswerCtrl', ['$scope', 'questionBankManager', 'dialogService', 'Upload', 'materialTypeEnum', 'answerTypesEnum',
        'defaulQuestionValuesByAnswerTypeEnum', '$translate',
        function ($scope, questionBankManager, dialogService, Upload, materialTypeEnum, answerTypesEnum,
            defaulQuestionValuesByAnswerTypeEnum, $translate) {
            $scope.downloadFileUrl = webConfig.serviceBase + "api/download/answerMaterials";
            $scope.questionTypesEnum = answerTypesEnum;
            $scope.materialTypeEnum = materialTypeEnum;
            $scope.fileModel = null;

            $scope.init = function () {
                questionBankManager.questionTypes().then(function (data) {
                    $scope.questionTypes = data;
                });
            };

            $scope.getQuestionTypeName = function (id) {
                return _.result(_.find($scope.questionTypes, {'id': id}), 'name');
                ;
            };

            $scope.resetAnswer = function () {
                $scope.newQuestion.secondsForQuestion = 0;
                switch ($scope.newQuestion.answerTypeId) {
                    case $scope.questionTypesEnum.singleChoice:
                        $scope.newQuestion.points = defaulQuestionValuesByAnswerTypeEnum.singleChoice.points;
                        $scope.newQuestion.minutesForQuestion = defaulQuestionValuesByAnswerTypeEnum.singleChoice.minutesForQuestion;
                        $scope.newQuestion.possibleAnswer = {answer: []};
                        break;
                    case $scope.questionTypesEnum.multipleChoice:
                        $scope.newQuestion.points = defaulQuestionValuesByAnswerTypeEnum.multipleChoice.points;
                        $scope.newQuestion.minutesForQuestion = defaulQuestionValuesByAnswerTypeEnum.multipleChoice.minutesForQuestion;
                        $scope.newQuestion.possibleAnswer = {answer: []};
                        break;
                    case $scope.questionTypesEnum.order:
                        $scope.newQuestion.points = defaulQuestionValuesByAnswerTypeEnum.order.points;
                        $scope.newQuestion.minutesForQuestion = defaulQuestionValuesByAnswerTypeEnum.order.minutesForQuestion;
                        $scope.newQuestion.possibleAnswer = {answer: []};
                        break;
                    case $scope.questionTypesEnum.numeric:
                        $scope.newQuestion.points = defaulQuestionValuesByAnswerTypeEnum.numeric.points;
                        $scope.newQuestion.minutesForQuestion = defaulQuestionValuesByAnswerTypeEnum.numeric.minutesForQuestion;
                        $scope.newQuestion.possibleAnswer = {answer: null};
                        break;
                    case $scope.questionTypesEnum.text:
                        $scope.newQuestion.points = defaulQuestionValuesByAnswerTypeEnum.text.points;
                        $scope.newQuestion.minutesForQuestion = defaulQuestionValuesByAnswerTypeEnum.text.minutesForQuestion;
                        $scope.newQuestion.possibleAnswer = {answer: null};
                        break;
                }
            };

            $scope.validateModel = function () {
                var isValid = true;
                if (!$scope.newQuestion.possibleAnswer || !$scope.newQuestion.possibleAnswer.answer
                    || (angular.isArray($scope.newQuestion.possibleAnswer.answer) && !$scope.newQuestion.possibleAnswer.answer.length)) {
                    isValid = false;
                    dialogService.showNotification($translate.instant('SOFTPROFILE_CORRECT_ANSWER_IS_REQUIRED'), 'error');
                }
                switch ($scope.newQuestion.answerTypeId) {
                    case $scope.questionTypesEnum.numeric:
                        break;
                    case $scope.questionTypesEnum.text:
                        break;
                    case $scope.questionTypesEnum.singleChoice:
                        var correctAnswerNumber = _.filter($scope.newQuestion.possibleAnswer.answer, function (o) {
                            return o.isCorrect;
                        }).length;
                        if (correctAnswerNumber < 1) {
                            isValid = false;
                            dialogService.showNotification($translate.instant('SOFTPROFILE_CORRECT_ANSWER_MARK_IS_A_REQUIRED_FOR_ONE'), 'error');
                        }
                        if (correctAnswerNumber > 1) {
                            isValid = false;
                            dialogService.showNotification($translate.instant('SOFTPROFILE_CORRECT_ANSWER_MARK_IS_A_REQUIRED_FOR_ONE') + " " + $translate.instant('SOFTPROFILE_NOT_POSSIBLE_TO_SET_MORE_THAN_ONE'), 'error');
                        }
                        break;
                    case $scope.questionTypesEnum.multipleChoice:
                        var correctAnswerNumber = _.filter($scope.newQuestion.possibleAnswer.answer, function (o) {
                            return o.isCorrect;
                        }).length;
                        if (correctAnswerNumber < 2) {
                            isValid = false;
                            dialogService.showNotification($translate.instant('SOFTPROFILE_CORRECT_ANSWER_MARK_IS_A_REQUIRED_FOR_TWO'), 'error');
                        }
                        break;
                }
                return isValid;
            };

            $scope.onFileSelect = function ($files) {
                for (var index = 0; index < $files.length; index++) {
                    var $file = $files[index];
                    $scope.optionModel.material.file = {};
                    Upload.upload({
                        url: webConfig.serviceBase + "api/upload/answerMaterials",
                        method: "POST",
                        file: $file
                    }).success(function (data) {
                        $scope.optionModel.material.file.id = data.id;
                        $scope.optionModel.material.file.name = data.name;
                    }).error(function (data) {
                        dialogService.showNotification(data, 'warning');
                    });
                }
            };

            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.winAnswerOrderOption) {
                    $scope.winAnswerOrderOption = event.targetScope.winAnswerOrderOption;
                }
                if (event.targetScope.winChoiceOption) {
                    $scope.winChoiceOption = event.targetScope.winChoiceOption;
                }
            });

            var resetOptionModel = function () {
                $scope.optionModel = {
                    material: {
                        file: {}
                    }
                };
                $scope.fileModel = null;
                angular.element("input[name='fileOptionModel']").val(null);
            };

            function updateAnswerOption(data) {
                $scope.newQuestion.possibleAnswer.answer[getIndexById(data.id)] = data;
            }

            function getIndexById(id) {
                return _.findIndex($scope.newQuestion.possibleAnswer.answer, {id: id});
            }

            var currentWindow = function () {
                switch ($scope.newQuestion.answerTypeId) {
                    case $scope.questionTypesEnum.singleChoice:
                    case $scope.questionTypesEnum.multipleChoice:
                        return $scope.winChoiceOption;
                    case $scope.questionTypesEnum.order:
                        return $scope.winAnswerOrderOption;
                    default:
                        return null;
                }
            };

            $scope.editAnswerOrderOption = function (id) {
                $scope.optionModel = _.clone(_.find($scope.newQuestion.possibleAnswer.answer, {id: id}));
                currentWindow().open().center();
            };

            $scope.removeAnswerOrderOption = function (id) {
                _.remove($scope.newQuestion.possibleAnswer.answer, {id: id});
            };

            $scope.addAnswerOrderOption = function () {
                resetOptionModel();
                currentWindow().open().center();
            };

            $scope.closeOptionWin = function () {
                resetOptionModel();
                currentWindow().close();
            };

            var isAnswerCorrectOrderUnique = function () {
                var options = $scope.newQuestion.possibleAnswer.answer;
                var isExist = _.any(options, function (option) {
                    return option.id != $scope.optionModel.id && option.correctOrder == $scope.optionModel.correctOrder;
                });
                return !isExist;
            };

            var removeExtraData = function () {
                switch (parseInt($scope.optionModel.material.type)) {
                    case materialTypeEnum.image:
                    case materialTypeEnum.document:
                    case materialTypeEnum.video:
                    case materialTypeEnum.audio:
                        delete $scope.optionModel.material.url;
                        break;
                    case materialTypeEnum.link:
                        delete $scope.optionModel.material.file;
                        break;
                    default:
                        delete $scope.optionModel.material.url;
                        delete $scope.optionModel.material.file;
                        break;
                }
            };

            var isValid = function () {
                var isValid = true;
                if ($scope.newQuestion.answerTypeId == answerTypesEnum.order && !isAnswerCorrectOrderUnique()) {
                    isValid = false;
                    dialogService.showNotification($translate.instant('SOFTPROFILE_CORRECT_ORDER_MUST_BE_UNIQUE'), "warning");
                }
                if(($scope.optionModel.material.type == materialTypeEnum.audio
                    || $scope.optionModel.material.type == materialTypeEnum.video
                    || $scope.optionModel.material.type == materialTypeEnum.image) && (  !$scope.optionModel.material.file || !$scope.optionModel.material.file.id))
                {
                    isValid = false;
                    dialogService.showNotification($translate.instant('SOFTPROFILE_FILE_HAS_NOT_BEEN_UPLOADED'), "warning");
                }
                return isValid;
            };

            $scope.saveOption = function () {
                if (isValid()) {
                    removeExtraData();
                    if ($scope.optionModel.id) {
                        updateAnswerOption($scope.optionModel);
                    }
                    else {
                        $scope.optionModel.id = $scope.newQuestion.possibleAnswer.answer.length + 1;
                        $scope.newQuestion.possibleAnswer.answer.push($scope.optionModel);
                    }
                    $scope.closeOptionWin();
                }
            };
        }]);

