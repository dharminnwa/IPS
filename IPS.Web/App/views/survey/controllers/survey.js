(function () {
    'use strict';
    angular
        .module('ips.survey')
        .directive('toNumber', function () {
            return {
                require: 'ngModel',
                link: function (scope, elem, attrs, ctrl) {
                    ctrl.$parsers.push(function (value) {
                        return parseFloat(value || '');
                    });
                }
            };
        })

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.survey', {
                url: "/survey/:profileId/:stageId/:participantId/:isStandAlone",
                templateUrl: "views/survey/views/survey.html",
                controller: "surveyCtrl as survey",
                authenticate: true,
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('MYPROFILES_SURVEY');
                    },
                    load: ['injectCSS', function (injectCSS) {
                        return injectCSS.set("activeProfiles.css", 'views/activeProfiles/activeProfiles.css');
                    }],
                    load1: ['injectCSS', function (injectCSS) {
                        return injectCSS.set("survey.css", 'views/survey/survey.css');
                    }],
                    profile: function ($stateParams, profilesService) {
                        return profilesService.getById($stateParams.profileId);
                    },
                    surveyInfo: function ($stateParams, surveyService) {
                        return surveyService.getSurveyInfo($stateParams.participantId, $stateParams.stageId);
                    },
                    participantFullName: function ($stateParams, surveyService) {
                        return surveyService.getParticipantFullName($stateParams.participantId);
                    },
                    standAlone: function ($stateParams, authService) {
                        var isTrue = ($stateParams.isStandAlone === 'true');
                        authService.isStandaloneMode = isTrue;
                        return isTrue;
                    },
                    uiMessage: function ($stateParams, surveyService) {
                        return surveyService.getUIStartMessage($stateParams.participantId, $stateParams.stageId).then(function (data) {
                            return data;
                        })
                    },
                    isCompleted: function ($stateParams, finalKPIService) {
                        var query = '?$expand=Question&$filter=ParticipantId eq ' + $stateParams.participantId + ' and StageId eq ' + $stateParams.stageId;
                        return finalKPIService.getAnswers(query).then(function (data) {
                            return (data && data.length > 0);
                        });
                    },
                    stageName: function ($stateParams, surveyAnalysisService) {
                        return surveyAnalysisService.getStageName($stateParams.stageId);
                    },
                },
                data: {
                    displayName: '{{pageName}}',//'Survey',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])

    .controller('surveyCtrl', surveyCtrl)
    .factory("injectCSS", ['$q', '$http', function ($q, $http) {
        var injectCSS = {};

        var createLink = function (id, url) {
            var link = document.createElement('link');
            link.id = id;
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = url;
            return link;
        }

        var checkLoaded = function (url, deferred, tries) {
            for (var i in document.styleSheets) {
                var href = document.styleSheets[i].href || "";
                if (href.split("/").slice(-1).join() === url) {
                    deferred.resolve();
                    return;
                }
            }
            tries++;
            setTimeout(function () { checkLoaded(url, deferred, tries); }, 50);
        };

        injectCSS.set = function (id, url) {
            var tries = 0,
              deferred = $q.defer(),
              link;

            if (!angular.element('link#' + id).length) {
                link = createLink(id, url);
                link.onload = deferred.resolve;
                angular.element('head').append(link);
            }
            checkLoaded(url, deferred, tries);

            return deferred.promise;
        };

        return injectCSS;
    }]);

    surveyCtrl.$inject = ['$scope', '$stateParams', '$filter', 'profile', 'surveyService', 'authService', '$location',
        'activeProfilesService', 'isCompleted', 'surveyInfo', 'standAlone', 'uiMessage', '$state', 'stageName', 'participantFullName', '$translate'];

    function surveyCtrl($scope, $stateParams, $filter, profile, surveyService, authService, $location,
        activeProfilesService, isCompleted, surveyInfo, standAlone, uiMessage, $state, stageName, participantFullName, $translate) {
        var vm = this;

        vm.answerTypes = surveyService.getAnswers();
        vm.profile = profile;
        vm.surveyInfo = surveyInfo;
        vm.currentStepIndex = 0;
        vm.uiMessage = uiMessage;
        vm.currentStep;
        vm.stageName = stageName;
        vm.participantFullName = participantFullName;
        vm.summary = [];
        vm.answers = [];
        vm.isLast = isLastStep();
        vm.resultAnswers = [];
        vm.currentProgress = 0;
        vm.progress = [];
        vm.totalWeakKPI = 0;
        vm.totalStrongKPI = 0;
        vm.questionsOrder = 'skillName';
        vm.stageId = $stateParams.stageId;
        vm.participantId = $stateParams.participantId;
        vm.isCompleted = false;
        vm.isStandAlone = standAlone;
        vm.goalName = '';
        vm.checkValue=checkValue;
        vm.tableHead = {};
        console.log(vm);
        function checkValue($this)
        {
            console.log($this);
        }
        function setupHeaders() {
            if (vm.summary.length > 0) {
                vm.scoreName = vm.summary[0].currentScoreName;
                vm.goalName = vm.summary[0].currentGoalName;
                vm.tableHead = createTableHeaders();
            }
        };

        function createTableHeaders() {
            var headers = {
                1: {
                    name: $translate.instant('COMMON_SKILL'),
                    isSort: true,
                    sortBy: 'skillName',
                    currentSort: true,
                    isHidable: false
                },
                2: {
                    name: $translate.instant('COMMON_PERFORMANCE_GROUP'),
                    isSort: true,
                    sortBy: 'performanceGroupName',
                    currentSort: false,
                    isHidable: false
                },
                3: {
                    name: $translate.instant('MYPROFILES_QUESTION'),
                    isSort: true,
                    sortBy: 'questionText',
                    currentSort: false,
                    isHidable: false
                },
                4: {
                    name: $translate.instant('COMMON_SCORE'),
                    isSort: true,
                    sortBy: 'answer.value',
                    currentSort: false,
                    isHidable: false
                },
                5: {
                    name: $translate.instant('COMMON_KPI'),
                    isSort: true,
                    sortBy: 'answer.kPIType',
                    currentSort: false,
                    isHidable: true
                },
                6: {
                    name: $translate.instant('MYPROFILES_WHY_IS_THIS_KPI_IMPORTANT_WHY_DO_YOU_CHOSE_THIS'),
                    isSort: false,
                    currentSort: false,
                    isHidable: false
                }
            };

            if (!vm.surveyInfo.isFirstStage) {
                headers = {
                    1: {
                        name: $translate.instant('COMMON_SKILL'),
                        isSort: true,
                        sortBy: 'skillName',
                        currentSort: true,
                        isHidable: false
                    },
                    2: {
                        name: $translate.instant('COMMON_PERFORMANCE_GROUP'),
                        isSort: true,
                        sortBy: 'performanceGroupName',
                        currentSort: false,
                        isHidable: false
                    },
                    3: {
                        name: $translate.instant('MYPROFILES_QUESTION'),
                        isSort: true,
                        sortBy: 'questionText',
                        currentSort: false,
                        isHidable: false
                    },
                    4: {
                        name: vm.scoreName,
                        isSort: true,
                        sortBy: 'answer.value',
                        currentSort: false,
                        isHidable: false
                    },
                    5: {
                        name: vm.goalName,
                        isSort: true,
                        sortBy: 'currentGoal',
                        currentSort: false,
                        isHidable: false
                    },
                    6: {
                        name: $translate.instant('COMMON_PROGRESS'),
                        isSort: true,
                        sortBy: 'progressValue',
                        currentSort: false,
                        isHidable: false
                    },
                    7: {
                        name: $translate.instant('COMMON_KPI'),
                        isSort: true,
                        sortBy: 'answer.kPIType',
                        currentSort: false,
                        isHidable: true
                    },
                    8: {
                        name: $translate.instant('MYPROFILES_WHY_IS_THIS_KPI_IMPORTANT_WHY_DO_YOU_CHOSE_THIS'),
                        isSort: false,
                        currentSort: false,
                        isHidable: false
                    }
                };
            }
            return headers;
        }
        vm.sortCondition = {
            column: '1',
            descending: false
        }

        createSurvey();

        function createSurvey() {
            if (isCompleted && !surveyInfo.isOpen) {
                vm.isCompleted = true;
                vm.uiMessage = $translate.instant('MYPROFILES_YOU_HAD_ALREADY_PASSED_THIS_SURVEY_THANK_YOU');
            }
            var surveyInfoObj = vm.surveyInfo;
            surveyInfoObj.isFinalStage = false;

            surveyService.initializeStepData(vm.profile, surveyInfoObj).then(function () {
                vm.stepData = surveyService.getStepData();
                setFirstStep();
                vm.answers = surveyService.getAnswers();
                if (vm.stepData && vm.stepData.steps) {
                    setCurrentStep();
                    initializeProgress();
                }
                if (vm.answers && vm.answers.length > 0) {
                    vm.answerMin = vm.answers[0].value;
                    vm.answerMax = vm.answers[vm.answers.length - 1].value;
                }
            });
            
            checkIsSetKPI();
        }

        function setFirstStep() {
            if (vm.uiMessage && vm.stepData) {
                vm.stepData.steps.splice(0, 0, {});
            }
        }

        function checkIsSetKPI() {
            if (!vm.profile.setKPIInSurvey) {
                vm.profile.kpiStrong = 0;
                vm.profile.kpiWeak = 0;
            }
        }

        function nextStep() {
            if (vm.stepData && vm.stepData.steps && vm.currentStepIndex != vm.stepData.steps.length) {
                vm.currentStepIndex += 1;
                setCurrentStep();
                updateProgress()
            }
        }

        function perviousStep() {
            if (vm.currentStepIndex != 0) {
                vm.currentStepIndex -= 1;
                setCurrentStep();
                updateProgress();
            }
        }

        function setCurrentStep() {
            vm.currentStep = vm.stepData.steps[vm.currentStepIndex];
        }

        function updateProgress() {
            if (vm.currentStepIndex <= 0) {
                vm.currentProgress = 0;
            } else {
                if (vm.currentStepIndex - 1 > vm.progress.length) {
                    vm.currentProgress = vm.progress[vm.progress.length];
                } else {
                    vm.currentProgress = vm.progress[vm.currentStepIndex - 1];
                }
            }
        }

        function initializeProgress() {
            if (vm.progress.length > 0) {
                vm.progress.splice(0, vm.progress.length);
            }
            var stepPersent = Math.round(100 / vm.stepData.steps.length);
            for (var i = 1, len = vm.stepData.steps.length; i <= len; i++) {
                vm.progress.push(i * stepPersent);
            }
        }

        function isLastStep() {
            if (vm.stepData && vm.stepData.steps) {
                return (vm.currentStepIndex == vm.stepData.steps.length);
            }
            return false;
        }

        function getSummary() {
            goThroughSteps(vm.stepData.steps);
            setupHeaders();
        }

        function goThroughSteps(steps) {
            if (vm.summary.length > 0) {
                vm.summary.splice(0, vm.summary.length)
            }
            for (var i = 0, len = steps.length; i < len; i++) {
                goThroughPerformanceGroups(steps[i]);
            }
        }

        function goThroughPerformanceGroups(performanceGroups) {
            for (var i = 0, len = performanceGroups.length; i < len; i++) {
                goThroughSkills(performanceGroups[i].skills, performanceGroups[i].name);
            }
        }

        function goThroughSkills(skills, pgName) {
            for (var i = 0, len = skills.length; i < len; i++) {
                goThroughQuestions(skills[i].questions, pgName, skills[i].name);
            }
        }

        function goThroughQuestions(questions, pgName, skillName) {
            for (var i = 0, len = questions.length; i < len; i++) {
                var question = questions[i];
                setAnswerColor(question);
                question['performanceGroupName'] = pgName;
                question['skillName'] = skillName;
                question['progressValue'] = question.answer.value - question.currentGoal;
                vm.summary.push(question);
            }
        }

        function setAnswerColor(question) {

            var originalAnswer = getById(question.answer.value, vm.answers, 'value')
            console.log(originalAnswer);
            question.answer['color'] = (originalAnswer!=undefined)?originalAnswer.color:'';
        }

        function getById(id, myArray, searchParam) {
            (!searchParam) ? searchParam = 'id' : '';
            return myArray.filter(function (obj) {
                if (obj[searchParam] == parseInt(id, 10)) {
                    return obj
                }
            })[0]
        }

        function increaseKPI(answer, fromLimit) {
            if (!answer) return;
            var kpiWeak = 1;
            var kpiStrong = 2;
            (!fromLimit) ? fromLimit = false : '';
            if (!isNotKPILimit(kpiWeak) && !fromLimit && answer.kPIType == kpiWeak) {
                vm.totalWeakKPI--;
                fromLimit = true;
            }

            switch (answer.kPIType) {
                case kpiWeak:
                    answer.kPIType = kpiStrong;
                    if (isNotKPILimit(kpiStrong)) {
                        (fromLimit) ? '' : vm.totalWeakKPI--;
                        vm.totalStrongKPI++;
                    } else {
                        increaseKPI(answer, true);
                    }
                    break;
                case kpiStrong:
                    answer.kPIType = null;
                    (fromLimit) ? '' : vm.totalStrongKPI--;
                    break;
                default:
                    answer.kPIType = kpiWeak;
                    if (isNotKPILimit(kpiWeak)) {
                        vm.totalWeakKPI++;
                    } else {
                        increaseKPI(answer, true);
                    }
                    break;
            }
        }

        function isNotKPILimit(kpiType) {
            var kpiWeak = 1;
            var kpiStrong = 2;
            switch (kpiType) {
                case kpiWeak:
                    var result = (vm.totalWeakKPI < vm.profile.kpiWeak);
                    return result;
                    break;
                case kpiStrong:
                    var result = (vm.totalStrongKPI < vm.profile.kpiStrong);
                    return result;
                    break;
            }
        }

        function changeSorting(columnIndex, column) {
            if (column.isSort) {
                if (vm.sortCondition.column == columnIndex) {
                    vm.sortCondition.descending = !vm.sortCondition.descending;
                    order(column.sortBy, vm.sortCondition.descending)
                } else {
                    vm.sortCondition.column = columnIndex;
                    vm.sortCondition.descending = false;
                    order(column.sortBy, vm.sortCondition.descending)
                }
            }
        }

        function order(predicate, reverse) {
            if (predicate) {
                var orderBy = $filter('orderBy');
                (predicate == 'answer.value') ? predicate = valueParser : '';
                vm.summary = orderBy(vm.summary, predicate, reverse);
            }
        }

        function valueParser(question) {
            return parseInt(question.answer.value);
        }

        function addSortingClass(columnIndex, column) {
            var elClass = '';

            if (column.isSort) {
                elClass += 'sortable ';
            }
            if (columnIndex == vm.sortCondition.column) {
                elClass += 'sort-' + vm.sortCondition.descending;
                column.currentSort = true;
            } else {
                column.currentSort = false;
            }
            return elClass;
        }

        function addHideClass(columnIndex, column) {
            var elClass = '';

            if (column.isHidable) {
                if (!vm.profile.setKPIInSurvey) {
                    elClass += 'hide ';
                }
            }
            return elClass;
        }

        function isRequired() {
            return !(vm.totalWeakKPI == vm.profile.kpiWeak && vm.totalStrongKPI == vm.profile.kpiStrong);
        }

        function submitSurvey() {
            var surveyResult = [];
            var agreements = vm.surveyInfo.agreements;
            if (typeof agreements == "undefined" || agreements == null || agreements.length == 0) {
                agreements = null;
            }
            console.log(vm.summary);
            for (var i = 0; i < vm.summary.length; i++) {
                var kpi = vm.summary[i].answer.kPIType;
                if ((kpi == null || kpi == 0) && agreements != null) {
                    for (var j = 0; j < agreements.length; j++) {
                        if (vm.summary[i].id == agreements[j].questionId) {
                            kpi = agreements[i].kpiType;
                            break;
                        }
                    }
                }
                var answer = {
                    stageId: vm.stageId,
                    participantId: vm.participantId,
                    questionId: vm.summary[i].id,
                    isCorrect: true,
                    answer1: vm.summary[i].answer.value,
                    kPIType: kpi,
                    comment: vm.summary[i].answer.comment
                }
                surveyResult.push(answer);
            }
            if (vm.surveyInfo) {
                if (agreements != null) {
                    for (var i = 0; i < agreements.length; i++) {
                        var isAnswered = false;
                        for (var j = 0; j < surveyResult.length; j++) {
                            if (agreements[i].questionId == surveyResult[j].questionId) {
                                isAnswered = true;
                                break;
                            }
                        }
                        if (!isAnswered) {
                            var answer = {
                                stageId: vm.stageId,
                                participantId: vm.participantId,
                                questionId: agreements[i].questionId,
                                isCorrect: true,
                                answer1: agreements[i].finalScore,
                                kPIType: agreements[i].kpiType,
                                comment: agreements[i].comment
                            }
                            surveyResult.push(answer);
                        }
                    }
                }
            }
            console.log(surveyResult);
            surveyService.submitSurvey(surveyResult).then(function (data) {
                notification($translate.instant('MYPROFILES_SURVEY_SUBMITED_SUCCESSFULLY'));
                if ((vm.surveyInfo.evaluateeId == 0 && vm.surveyInfo.isSelfEvaluated && vm.surveyInfo.isFirstStage) ||
                    (vm.surveyInfo.evaluateeId != 0 && vm.surveyInfo.isFirstStage))
                    $scope.setKPIs();
                else
                    changeTemplate();
            },
            function (data) {
                notification($translate.instant('MYPROFILES_SURVEY_SUBMIT_FAILED'));
            })
        }

        function notification(message) {
            $scope.notificationSavedSuccess.show(message, "info");
        }

        function changeTemplate() {
            vm.uiMessage = '';
            vm.isCompleted = true;
            //surveyService.getCompleteNotificationMessage(vm.participantId, vm.stageId).then(function (data) {
            //    if (data) {
            //        vm.uiMessage = data;
            //    } else {
            //        vm.uiMessage = "You have successfully passed this survey. Thank You!";
            //    }
            //})

            $state.go("home.activeProfiles", null, { reload: true });
        }

        function goBack() {
            $state.go(
                $state.$current.parent.self.name,
                null,
                { reload: true }
            );
        }

        $scope.logOut = function () {
            authService.logOut();
            $location.path('/login');
        };

        $scope.goHome = function () {
            $location.path('/home');
        };

        $scope.setKPIs = function () {
            $location.path('/home/KPI/' + vm.profile.id + '/' + vm.stageId + '/' + vm.participantId);
        };

        $scope.showSetKPIButton = function () {
            return false;//vm.surveyInfo.isFirstStage && vm.surveyInfo.areKPISet;
        };

        $scope.$watch(function () {
            return isLastStep();
        }, function (newVal) {
            (newVal) ? getSummary() : '';
        })

        vm.getTrendClass = function (score, previousScore) {
            var result = score - previousScore;
            if (result == 0) {
                return 'trend-Equal';
            }
            if (result < 0) {
                return 'trend-Down';
            }
            if (result > 0) {
                return 'trend-Up';
            }
        }

        vm.getProgressClass = function (score, goalScore) {
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

        vm.getTrainingsLink = function (trainingId) {
            $location.path('/home/profiles/profiles/soft/trainings/edit/' + trainingId);
        }

        vm.getAnswerColor = function (value) {
            var result = getById(value, vm.answerTypes, 'value');
            if (result) {
                return result.color;
            }
        }

        /*vm.isEqual = function (answer, myAnswer) {
            return !answer || !myAnswer ? false : answer == parseInt(myAnswer, 10);
        }*/

        vm.submitSurvey = submitSurvey;
        vm.nextStep = nextStep;
        vm.isRequired = isRequired;
        vm.changeSorting = changeSorting;
        vm.addSortingClass = addSortingClass;
        vm.addHideClass = addHideClass;
        vm.isLastStep = isLastStep;
        vm.perviousStep = perviousStep;
        vm.increaseKPI = increaseKPI;
        vm.goBack = goBack;
    }

})();