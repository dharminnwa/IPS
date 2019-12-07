'use strict';
angular
    .module('ips.survey')
    .constant("questionDisplayRulesEnum", {
        performanceGroupPerStep: 1,
        questionPerStep: 2,
        allQuestionsOnTheSinglePage: 3
    })
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('home.knowledgetest_survey', {
                url: "/knowledgetest_survey/:profileId/:stageId/:participantId/:stageEvolutionId",
                templateUrl: "views/survey/views/kt-survey.html",
                controller: "ktSurveyCtrl as survey",
                authenticate: true,
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('MYPROFILES_SURVEY');
                    },
                    participantId: function ($stateParams) {
                        return $stateParams.participantId;
                    },
                    stageId: function ($stateParams) {
                        return $stateParams.stageId;
                    },
                    profileId: function ($stateParams) {
                        return $stateParams.profileId;
                    },
                    stageEvolutionId: function ($stateParams) {
                        return $stateParams.stageEvolutionId;
                    },
                    surveyInfo: function ($stateParams, surveyService) {
                        return surveyService.getKTSurvey($stateParams.profileId, $stateParams.participantId, $stateParams.stageEvolutionId);
                    },
                    uiMessage: function ($stateParams, surveyService) {
                        return surveyService.getUIStartMessage($stateParams.participantId, $stateParams.stageId, $stateParams.stageEvolutionId).then(function (data) {
                            return data;
                        })
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Survey',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])

    .controller('ktSurveyCtrl', ['$scope', 'surveyInfo', '$location', '$timeout',
        'questionDisplayRulesEnum', 'cssInjector', 'stageId', 'participantId', 'surveyService', 'profileId',
        'stageEvolutionId', '$state', 'uiMessage', '$translate',
        function ($scope, surveyInfo, $location, $timeout,
            questionDisplayRulesEnum, cssInjector, stageId, participantId, surveyService, profileId,
            stageEvolutionId, $state, uiMessage, $translate) {
            cssInjector.removeAll();
            cssInjector.add('views/survey/kt-survey.css');
            var currentStepIndex = 0;
            var lastStepIndex = 0;
            var performanceGroupsId = [];
            _.forEach(surveyInfo.performanceGroupNames, function (value, key) {
                performanceGroupsId.push(key);
            });
            $scope.profileName = surveyInfo.profileName;
            $scope.surveyTime = 0;
            $scope.remainingSurveyTime = 0;
            $scope.isPause = false;
            $scope.uiMessage = uiMessage;
            var uiMessageVisible = !!uiMessage;

            $scope.questions = surveyInfo.questions;

            var timeFinished = false;

            $scope.timerFinished = function () {
                $timeout(function () {
                    $scope.survey.isSurveyCommentPage = true;
                    timeFinished = true;
                }, 1);
            };

            $scope.isShowUIMessage = function () {
                return $scope.uiMessage && uiMessageVisible && currentStepIndex == 0;
            };

            $scope.isUIMessagePreviousButtonVisible = function () {
                return $scope.uiMessage && currentStepIndex == 0;
            }

            var getLastStepIndex = function () {
                if ($scope.isDisplayPerformanceGroupPerStep()) {
                    return performanceGroupsId.length - 1;
                }
                if ($scope.isDisplayAllQuestionsOnTheSinglePage()) {
                    return 0;
                }
                return surveyInfo.questions.length - 1;
            };

            $scope.runSurvey = function () {
                uiMessageVisible = false;
                if ($scope.surveyTime) {
                    startTimer();
                }
                else {
                    $scope.survey.isSurveyCommentPage = true;
                    timeFinished = true;
                }
            };

            $scope.showUIMessage = function () {
                uiMessageVisible = true;
                stopTimer();
            };

            $scope.nextStep = function () {
                if ($scope.checkBeforeNext()) {
                    if (currentStepIndex < lastStepIndex) {
                        currentStepIndex++;
                        setCurrentStepData();
                    }
                    else {
                        stopTimer();
                        $scope.survey.isSurveyCommentPage = true;
                    }
                }
            };
            // added for IPS2018-15 tocheck for multiple answer less questions at multiple question setting
            $scope.checkBeforeNext = function () {
                var result = true;

                if ($scope.isSingleOrMultipleChoiceQuestion(currentStepIndex)) {
                    var totalAnswersToSelect = $.parseJSON(surveyInfo.questions[currentStepIndex].possibleAnswer).filter(function (el) {
                        if (el.isCorrect) {
                            return el;
                        }
                    }).length;

                    if (!isQuestionAnswered(surveyInfo.questions[currentStepIndex])) {
                        $scope.notification($translate.instant('MYPROFILES_PLEASE_SELECT_AT_LEAST') + " " + totalAnswersToSelect + " " + $translate.instant('MYPROFILES_ANSWERS'));
                        result = false;
                    }
                    else {
                        var userTotalAnswered = surveyInfo.questions[currentStepIndex].userAnswer.length;

                        if (userTotalAnswered < totalAnswersToSelect) {
                            $scope.notification($translate.instant('MYPROFILES_PLEASE_SELECT_AT_LEAST') + " " + totalAnswersToSelect + " " + $translate.instant('MYPROFILES_ANSWERS'));
                            result = false;
                        }
                    }
                }
                else {
                    if (!isQuestionAnswered(surveyInfo.questions[currentStepIndex])) {
                        $scope.notification($translate.instant('MYPROFILES_PLEASE_SET_YOUR_ANSWERS'));
                        result = false;
                    }
                }

                return result;
            }

            $scope.isSingleOrMultipleChoiceQuestion = function (currentQuestionIndex) {
                try {
                    var obj = $.parseJSON(surveyInfo.questions[currentQuestionIndex].possibleAnswer);
                    if (typeof (obj) == "object") {
                        var correctOptions = _.filter(obj, function (item) {
                            return item.isCorrect;
                        });

                        if (correctOptions.length > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }
                catch (e) {
                    return false;
                }
            }

            $scope.perviousStep = function () {
                if ($scope.survey.isSurveyCommentPage == true) {
                    $scope.survey.isSurveyCommentPage = false;
                    startTimer();
                }
                else {
                    currentStepIndex--;
                    setCurrentStepData();
                }
            };

            $scope.isDisplayPerformanceGroupPerStep = function () {
                return surveyInfo.questionsDisplayRuleId == questionDisplayRulesEnum.performanceGroupPerStep;
            };

            $scope.isDisplayQuestionPerStep = function () {
                return surveyInfo.questionsDisplayRuleId == questionDisplayRulesEnum.questionPerStep;
            };

            $scope.isDisplayAllQuestionsOnTheSinglePage = function () {
                return surveyInfo.questionsDisplayRuleId == questionDisplayRulesEnum.allQuestionsOnTheSinglePage;
            };

            $scope.isShowPreviousStep = function () {
                if (!surveyInfo.allowRevisitAnsweredQuestions) {
                    return false;
                }
                else if (timeFinished) {
                    return false;
                }
                else if ($scope.survey.isSurveyCommentPage) {
                    return true;
                }
                return currentStepIndex != 0;
            };

            $scope.isShowNavigationPanel = function () {
                return surveyInfo.allowRevisitAnsweredQuestions;
            };

            var setCurrentStepData = function () {
                if ($scope.isDisplayPerformanceGroupPerStep()) {
                    $scope.currentStepData = _.filter(surveyInfo.questions, function (question) {
                        return question.performanceGroupId == performanceGroupsId[currentStepIndex];
                    });
                }
                if ($scope.isDisplayQuestionPerStep()) {
                    $scope.currentStepData = surveyInfo.questions[currentStepIndex];
                }
                if ($scope.isDisplayAllQuestionsOnTheSinglePage()) {
                    $scope.currentStepData = surveyInfo.questions;
                }
            };

            $scope.currentQuestionNumber = function () {
                return currentStepIndex + 1;
            };

            $scope.getCurrentPerformanceGroupName = function () {
                return surveyInfo.performanceGroupNames[performanceGroupsId[currentStepIndex]];
            };

            $scope.getPerformanceGroupById = function (id) {
                return surveyInfo.performanceGroupNames[id];
            };

            $scope.notification = function (message) {
                $scope.notificationSavedSuccess.show(message, "info");
            };

            var isQuestionAnswered = function (question) {
                return !!(question.userAnswer && (!_.isArray(question.userAnswer) || question.userAnswer.length));

            };

            $scope.isQuestionByIndexAnswered = function (index) {
                return isQuestionAnswered(surveyInfo.questions[index]);
            };

            var shuffleQuestionsAfterPause = function () {
                var answeredQuestions = [];
                var nonAnsweredQuestions = [];
                _.forEach(surveyInfo.questions, function (question) {
                    if (isQuestionAnswered(question)) {
                        answeredQuestions.push(question);
                    }
                    else {
                        nonAnsweredQuestions.push(question);
                    }
                });
                if (!$scope.isDisplayPerformanceGroupPerStep()) {
                    if (nonAnsweredQuestions.length > 0) {
                        currentStepIndex = answeredQuestions.length;
                    }
                }
                surveyInfo.questions = answeredQuestions.concat(_.shuffle(nonAnsweredQuestions));
                setCurrentStepData();
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.pauseSurvey = function () {
                $scope.isPause = true;
                stopTimer();
            };

            $scope.continueSurvey = function () {
                $scope.isPause = false;
                startTimer();
                shuffleQuestionsAfterPause();
            };

            var startTimer = function () {
                $scope.$broadcast('timer-start');
            };

            var stopTimer = function () {
                $scope.$broadcast('timer-stop');
            };

            $scope.$on('timer-tick', function (event, args) {
                $scope.remainingSurveyTime = args.millis;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });

            $scope.init = function () {
                if (surveyInfo.randomizeQuestions) {
                    surveyInfo.questions = _.shuffle(surveyInfo.questions);
                }
                setCurrentStepData();

                $scope.surveyTime = _.sum(surveyInfo.questions, function (question) {
                    return question.timeForQuestion;
                });
                lastStepIndex = getLastStepIndex();
                if (!uiMessage && $scope.surveyTime) {
                    startTimer();
                }
                else if (!uiMessage) {
                    $scope.survey.isSurveyCommentPage = true;
                    timeFinished = true;
                }
            };

            var getTimeSpent = function () {
                return $scope.surveyTime - $scope.remainingSurveyTime / 1000;
            };

            $scope.saveAnswers = function () {
                stopTimer();
                var timeSpent = getTimeSpent();
                var data = {
                    stageId: stageId,
                    stageEvolutionId: stageEvolutionId,
                    participantId: participantId,
                    timeSpent: timeSpent
                };
                data.questionAnswers = _.map(surveyInfo.questions, function (item) {
                    var userAnswer = item.userAnswer ? (_.isObject(item.userAnswer) ? JSON.stringify(item.userAnswer) : item.userAnswer) : '';
                    return { questionId: item.questionId, userAnswer: userAnswer, comment: item.comment };
                });
                surveyService.saveKTAnswers(data).then(function (data) {
                    if (data.isSurveyCompleted) {
                        $location.path("/home/knowledgetest_result/" + profileId + "/" + stageId + "/" + participantId + '/' + stageEvolutionId);
                    }
                    else {
                        $state.go("home.activeProfiles", null, { reload: true });
                    }
                });
            };

            $scope.changeQuestion = function (questionIndex) {
                currentStepIndex = questionIndex;
                setCurrentStepData();
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.isNextDenied = function () {
                return !surveyInfo.allowRevisitAnsweredQuestions;
            };

            $scope.isSurveyCommentPage = false;
        }]);