'use strict';

angular
    .module('ips.survey')
    .service('surveyService', ['$q', 'apiService', function ($q, apiService) {
        var baseSurveyUrl = 'survey';
        var stepData = [];

        var answers = [];

        this.initializeStepData = function (profile, surveyInfo) {
            return $q.when(initializeStepData(profile, surveyInfo));
        };

        this.getStepData = function () {
            return stepData;
        };

        this.getKTSurvey = function (profileId, participantId, stageEvolutionId) {
            return $q.when(getKTSurvey(profileId, participantId, stageEvolutionId));
        };

        this.getAnswers = function () {
            return answers;
        };

        this.submitSurvey = function (answers) {
            return $q.when(submitSurvey(answers));
        };

        this.generateAnswers = function (scaleRanges) {
            return $q.when(generateAnswers(scaleRanges));
        };

        this.getSurveyInfo = function (participantId, stageId) {
            return $q.when(getSurveyInfo(participantId, stageId));
        };

        this.getCompleteNotificationMessage = function (participantId, stageId) {
            return $q.when(getCompleteNotificationMessage(participantId, stageId));
        };

        this.getUIStartMessage = function (participantId, stageId, stageEvolutionId) {
            return $q.when(getUIStartMessage(participantId, stageId, stageEvolutionId));
        };

        this.getKTSurveyResult = function (profileId, stageId, participantId, stageEvolutionId) {
            return $q.when(getKTSurveyResult(profileId, stageId, participantId, stageEvolutionId));
        };

        this.getKTAggregatedSurveyResult = function (profileId, stageId, participantId, stageEvolutionId) {
            return $q.when(getKTAggregatedSurveyResult(profileId, stageId, participantId, stageEvolutionId));
        };


        this.getKTFinalKPI = function (profileId, stageId, participantId, stageEvolutionId) {
            var apiName = 'survey/kt/final_KPI/' + profileId + "?participantId=" + participantId;
            if (stageId) {
                apiName += '&stageId=' + stageId;
            }
            if (stageEvolutionId) {
                apiName += '&stageEvolutionId=' + stageEvolutionId;
            }
            return apiService.getAll(apiName);
        };

        this.getKTFinalKPIPreviousResults = function (profileId, participantId, stageEvolutionId) {
            var apiName = 'survey/kt/final_KPI_PreviousResults/' + profileId + "?participantId=" + participantId;

            apiName += '&stageEvolutionId=' + stageEvolutionId;
            var deferred = $q.defer();

            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        this.saveKTFinalKPI = function (stageId, stageEvolutionId,
            participantId, nextStageQuestionsId, surveyAnswerAgreements) {
            var apiName = baseSurveyUrl + '/kt/final_KPI';
            var data = {
                stageId: stageId,
                stageEvolutionId: stageEvolutionId,
                participantId: participantId,
                nextStageQuestionsId: nextStageQuestionsId,
                surveyAnswerAgreements: surveyAnswerAgreements
            };

            return apiService.add(apiName, data);
        };

        this.getCurrentStageTitle = function (surveyInfo) {
            return getCurrentStageTitle(surveyInfo);
        };

        this.getPrevStageTitle = function (surveyInfo) {
            return getPrevStageTitle(surveyInfo);
        };

        this.getAgreement = function (questionId, agreements) {
            return getAgreement(questionId, agreements);
        };

        this.getCurrentStageGoal = function (surveyInfo, agreement) {
            return getCurrentStageGoal(surveyInfo, agreement);
        };

        this.getParticipantFullName = function (participantId) {
            return getParticipantFullName(participantId);
        };

        function initializeStepData(profile, surveyInfo) {
            var deferred = $q.defer();
            if (profile && profile.questionDisplayRuleId) {
                switch (profile.questionDisplayRuleId) {
                    case 1:
                        performanceGroupPerPage(profile, surveyInfo);
                        break;
                    case 2:
                        questionPerPage(profile, surveyInfo);
                        break;
                    case 3:
                        singlePage(profile, surveyInfo);
                        break;
                    default:
                        break;
                }
            }
            deferred.resolve();

            return deferred.promise;
        }

        function getKTSurvey(profileId, participantId, stageEvolutionId) {
            var deferred = $q.defer();
            var apiName = baseSurveyUrl + '/kt/' + profileId + '?participantId=' + participantId;
            if (stageEvolutionId) {
                apiName += '&stageEvolutionId=' + stageEvolutionId;
            }
            apiService.getAll(apiName).then(function (data) {
                if (!data.randomizeQuestions) {
                    data.questions = _.sortBy(data.questions, function (question) {
                        return question.seqNo;
                    });
                }
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        this.saveKTAnswers = function (data) {
            return $q.when(saveKTAnswers(data));
        };

        function saveKTAnswers(data) {
            var deferred = $q.defer();
            var apiName = baseSurveyUrl + '/kt/';
            apiService.add(apiName, data).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getSurveyInfo(participantId, stageId) {
            var deferred = $q.defer();
            var apiName = 'stages/survey_info/' + stageId + "/" + participantId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getParticipantFullName(participantId) {
            var deferred = $q.defer();
            var apiName = 'stages/survey_participant_full_name/' + participantId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getCompleteNotificationMessage(participantId, stageId) {
            var deferred = $q.defer();
            var apiName = 'notification/getUICompleteMessage/' + participantId + "/" + stageId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getUIStartMessage(participantId, stageId, stageEvolutionId) {
            var deferred = $q.defer();
            var apiName = 'notification/getUIStartMessage?participantId=' + participantId;

            if (stageId) {
                apiName += '&stageId=' + stageId;
            }
            else {
                apiName += '&stageId=null';
            }

            if (stageEvolutionId) {
                apiName += '&stageEvolutionId=' + stageEvolutionId;
            }
            else {
                apiName += '&stageEvolutionId=null';
            }

            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function submitSurvey(answers) {
            var deferred = $q.defer();
            var apiName = 'answers';
            apiService.add(apiName, answers).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function questionPerPage(profile, surveyInfo) {
            var result = createSurveySteps(profile, true, surveyInfo);

            stepData['steps'] = [];
            for (var i = 0, len = result.steps.length; i < len; i++) {

                stepData.steps.push([result.steps[i]]);
            }
        }

        function performanceGroupPerPage(profile, surveyInfo) {
            var result = createSurveySteps(profile, false, surveyInfo);
            stepData['steps'] = [];
            for (var i = 0, len = result.steps.length; i < len; i++) {

                stepData.steps.push([result.steps[i]]);
            }
        }

        function singlePage(profile, surveyInfo) {
            var result = createSurveySteps(profile, false, surveyInfo);
            stepData['steps'] = [];
            stepData.steps.push(result.steps);
        }

        function createSurveySteps(profile, isQuestionPerPage, surveyInfo) {
            generateAnswers(profile.scale.scaleRanges);
            return {
                steps: goThroughPerformanceGroups(profile.performanceGroups, isQuestionPerPage, surveyInfo)
            }
        }

        function goThroughPerformanceGroups(perfGroups, isQuestioPerPage, surveyInfo) {
            var performanceGroups = [];
            (!isQuestioPerPage) ? isQuestioPerPage = false : '';
            var params = {
                isQuestioPerPage: isQuestioPerPage
            };
            if (perfGroups && perfGroups.length > 0) {
                for (var i = 0, len = perfGroups.length; i < len; i++) {
                    params['performanceGroupName'] = perfGroups[i].name;

                    var skills = goThroughSkills(perfGroups[i].link_PerformanceGroupSkills, params, surveyInfo);
                    if (skills && skills.length > 0 && !params.isQuestioPerPage) {
                        performanceGroups.push({
                            name: perfGroups[i].name,
                            skills: skills
                        })
                    }
                }
            }
            return (params.isQuestioPerPage) ? params.steps : performanceGroups;
        }

        function goThroughSkills(linkSkills, params, surveyInfo) {
            var skills = [];
            linkSkills = _.sortBy(linkSkills, function (item) {
                return item.skill.seqNo;
            })
            if (linkSkills && linkSkills.length > 0) {
                for (var i = 0, len = linkSkills.length; i < len; i++) {
                    params['skillName'] = linkSkills[i].skill.name;
                    var questions = goThroughQuestion(linkSkills[i].questions, params, surveyInfo);
                    if (questions && questions.length > 0 && !params.isQuestioPerPage) {
                        skills.push({
                            name: linkSkills[i].skill.name,
                            questions: questions
                        })
                    }
                }
                return skills;
            }
        }

        function goThroughQuestion(question, params, surveyInfo) {
            var questions = [];
            var kpiOnly = !(surveyInfo.isFirstStage || surveyInfo.isFinalStage);
            var isNewPhase = false;

            if (question && question.length > 0) {
                for (var i = 0, len = question.length; i < len; i++) {
                    if (!kpiOnly || isKPI(question[i].id, surveyInfo.agreements)) {
                        if (params.isQuestioPerPage) {
                            addSingleQuestion(params, question[i]);
                        } else {
                            if (surveyInfo.isFirstStage) {
                                if (surveyInfo.previousSurveyAnswers) {
                                    isNewPhase = true;
                                }
                            }
                            var agreement = getAgreement((surveyInfo.isFirstStage ? question[i].parentQuestionId : question[i].id), surveyInfo.agreements);
                            var prevAnswer = (surveyInfo.previousSurveyAnswers == null) ? null : getSubmittedAnswer((surveyInfo.isFirstStage ? question[i].parentQuestionId : question[i].id), surveyInfo.previousSurveyAnswers);
                            var questionDetail = {
                                id: question[i].id,
                                questionText: question[i].questionText,
                                answer: (surveyInfo.surveyAnswers && surveyInfo.surveyAnswers.length > 0) ? {
                                    value: getSubmittedAnswer(question[i].id, surveyInfo.surveyAnswers),
                                    comment: getSubmittedComment(question[i].id, surveyInfo.surveyAnswers)
                                } : {},
                                showExtendedInfo: !(surveyInfo.isFirstStage || surveyInfo.isFinalStage),
                                baseScore: (agreement == null) ? "" : agreement.finalScore,
                                prevScore: (prevAnswer == null) ? "" : prevAnswer,
                                currentGoal: (agreement == null) ? 0 : getCurrentStageGoal(surveyInfo, agreement),
                                currentGoalName: getCurrentStageTitle(surveyInfo) + " Goal",
                                currentScoreName: getCurrentStageTitle(surveyInfo) + " Score",
                                prevScoreName: getPrevStageTitle(surveyInfo) + " Score",
                                finalGoal: (agreement == null) ? "" : agreement.finalGoal,
                                kpiType: (agreement == null) ? "" : agreement.kpiType,
                                comment: (agreement == null) ? "" : agreement.comment,
                                trainings: (agreement == null) ? null : agreement.trainings
                            }
                            if (isNewPhase) {
                                questionDetail.showExtendedInfo = true;
                            }
                            questions.push(questionDetail)
                        }
                    }
                }
                return questions;
            }
        }

        function isKPI(questionId, agreements) {
            if (agreements) {
                for (var i = 0, len = agreements.length; i < len; i++) {
                    if (questionId == agreements[i].questionId) {
                        return agreements[i].kpiType > 0;
                    }
                }
            }
            return false;
        }

        function getSubmittedAnswer(questionId, answers) {
            for (var i = 0, len = answers.length; i < len; i++) {
                if (questionId == answers[i].questionId) {
                    return answers[i].answer1;
                }
            }
            return null;
        }

        function getSubmittedComment(questionId, answers) {
            for (var i = 0, len = answers.length; i < len; i++) {
                if (questionId == answers[i].questionId) {
                    return answers[i].comment;
                }
            }
            return "";
        }

        function getAgreement(questionId, agreements) {
            if (agreements) {
                for (var i = 0, len = agreements.length; i < len; i++) {
                    if (questionId == agreements[i].questionId) {
                        return agreements[i];
                    }
                }
            }
            return null;
        }

        function getCurrentStageTitle(surveyInfo) {
            return getStageTitle(surveyInfo.stageNo, surveyInfo.stages);
        }

        function getPrevStageTitle(surveyInfo) {
            return getStageTitle(surveyInfo.stageNo - 1, surveyInfo.stages);
        }

        function getStageTitle(stageNo, stages) {
            var result = "";
            if (stages) {
                if (stages.length > 1) {
                    var stageindex = 1;
                    _.each(stages, function (item) {
                        if (stageNo == stageindex) {
                            result = item.name;
                            return (false);
                        }
                        stageindex++;
                    });
                    return result;
                }
            }
            else {
                switch (stageNo) {
                    case 1:
                        return "Start ";
                    case 2:
                        return "Short ";
                    case 3:
                        return "Mid ";
                    case 4:
                        return "Long ";
                    case 5:
                        return "Final ";
                    default:
                        return "";
                }
            }
        }

        function getCurrentStageGoal(surveyInfo, agreement) {
            if (agreement.milestoneAgreementGoals) {
                if (agreement.milestoneAgreementGoals.length > 0) {
                    var result = 0;
                    var goalIndex = 1;
                    _.each(agreement.milestoneAgreementGoals, function (item) {
                        if (goalIndex == surveyInfo.stageNo - 1) {
                            result = item.goal;
                            return (false);
                        }
                        goalIndex++;
                    });
                    return result;
                }
            }
            else {
                switch (surveyInfo.stageNo) {
                    case 1:
                        return 0;
                    case 2:
                        return agreement.shortGoal;
                    case 3:
                        return agreement.midGoal;
                    case 4:
                        return agreement.longGoal;
                    case 5:
                        return agreement.finalGoal;
                    default:
                        return 0;
                }
            }
        }

        function generateAnswers(scaleRanges) {
            var deferred = $q.defer();
            if (answers.length > 0) {
                answers.splice(0, answers.length);
            }
            if (scaleRanges) {
                for (var i = 0, len = scaleRanges.length; i < len; i++) {
                    addAnswer(scaleRanges[i]);
                }
            }
            deferred.resolve('success');

            return deferred.promise;
        }

        function addAnswer(scaleRange) {
            var min = Math.floor(scaleRange.min);
            var max = Math.floor(scaleRange.max);
            max = (min == max) ? max + 1 : max;
            for (var i = min; i <= max; i++) {
                if (i == min) {
                    answers.push({
                        value: scaleRange.min,
                        color: scaleRange.color,
                    });
                }
                else if (i == max) {
                    answers.push({
                        value: scaleRange.max,
                        color: scaleRange.color
                    });
                }
                else {
                    answers.push({
                        value: i,
                        color: scaleRange.color
                    });

                }


            }
        }

        function addSingleQuestion(params, question) {
            var currentQuestion = {
                id: question.id,
                questionText: question.questionText,
                answer: {}
            };
            var questions = [];
            questions.push(currentQuestion);

            var skills = [];

            skills.push({
                name: params.skillName,
                questions: questions
            });

            var result = {
                name: params.performanceGroupName,
                skills: skills
            };

            if (!params.steps) {
                params['steps'] = [];
            }

            params.steps.push(result);
        }

        function getKTSurveyResult(profileId, stageId, participantId, stageEvolutionId) {
            var deferred = $q.defer();
            var apiName = 'survey/kt/result/' + profileId + "?participantId=" + participantId;
            if (stageId) {
                apiName += '&stageId=' + stageId;
            }
            else {
                apiName += '&stageId=null';
            }
            if (stageEvolutionId) {
                apiName += '&stageEvolutionId=' + stageEvolutionId;
            }
            else {
                apiName += '&stageEvolutionId=null';

            }
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getKTAggregatedSurveyResult(profileId, stageId, participantId, stageEvolutionId) {
            var deferred = $q.defer();
            var apiName = 'survey/kt/aggregatedResult/' + profileId + "?participantId=" + participantId;
            if (stageId) {
                apiName += '&stageId=' + stageId;
            }
            if (stageEvolutionId) {
                apiName += '&stageEvolutionId=' + stageEvolutionId;
            }
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
    }]);