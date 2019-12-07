'use strict';

angular
    .module('ips.performanceGroups')
    .service('questionTabService', ['$q', 'apiService', 'dialogService', '$translate',
        function ($q, apiService, dialogService, $translate) {
            var questions = new kendo.data.ObservableArray([]);

            var skills = new kendo.data.ObservableArray([]);
            this.questions = questions;
            this.skills = skills;

            function prepageQuestions(skills) {

                clearQuestions();

                var deferred = $q.defer();
                var result = [];
                if (skills) {
                    for (var i = 0, len = skills.length; i < len; i++) {
                        var skill = skills[i];
                        if (skill.questions) {
                            for (var j = 0, qlen = skill.questions.length; j < qlen; j++) {
                                var skillName, questionText, type, skillId, questionId, seqNo;

                                var question = skill.questions[j];
                                (skill.subSkillId) ? skillName = skill.subSkillName : skillName = skill.skillName;
                                (question.questionText) ? questionText = question.questionText : questionText = '';
                                (question.seqNo) ? seqNo = question.seqNo : seqNo = '0';
                                (skill.subSkillId) ? type = 'SS' : type = 'MS';
                                (skill.subSkillId) ? skillId = skill.subSkillId : skillId = skill.skillId;
                                var answerType = question && question.answerType ? question.answerType.typeName : '';

                                questionId = question.id;
                                result.push(
                                    {
                                        skill: skillName,
                                        skillId: skillId,
                                        question: questionText,
                                        answerType: answerType,
                                        questionId: questionId,
                                        seqNo: parseInt(seqNo),
                                        type: type,
                                        id: questionId,
                                        points: question.points ? question.points : 0
                                    }
                                )
                            }
                        }
                    }
                }
                questions.push.apply(questions, result);
                deferred.resolve('success');

                return deferred.promise;
            }

            function clearQuestions() {
                if (questions.length > 0) {
                    questions.splice(0, questions.length);
                }
            }

            function initializeSkills(linkSkills) {
                if (skills.length > 0) {
                    skills.splice(0, skills.length);
                }
                var deferred = $q.defer();
                if (linkSkills) {
                    for (var i = 0, len = linkSkills.length; i < len; i++) {
                        if (!getById(linkSkills[i].skillId, skills, 'skillId')) {
                            skills.push(linkSkills[i]);
                        }
                    }
                }
                deferred.resolve('success');
            }

            function getById(id, myArray, searchParam) {
                (!searchParam) ? searchParam = 'id' : '';
                return myArray.filter(function (obj) {
                    if (obj[searchParam] == id) {
                        return obj
                    }
                })[0]
            }

            function isMultipleQuestions(questions) {
                return (questions.length > 1);
            }

            this.prepageQuestions = function (performanceGroupSkills) {
                return $q.when(prepageQuestions(performanceGroupSkills));
            };

            this.initializeSkills = function (performanceGroupSkills) {
                return $q.when(initializeSkills(performanceGroupSkills));
            };

            this.validateQuestionsOrder = function () {
                var isValid = true;

                var orderError = {
                    zero: { invalid: false, errorMessage: $translate.instant('SOFTPROFILE_SET_NOT_ZERO_ORDER_TO_ALL_QUESTIONS') + "<br />" },
                    big: { invalid: false, errorMessage: $translate.instant('SOFTPROFILE_QUESTIONS_ORDERS_MUSTNT_BE_MORE_THAN_QUESTIONS_AMOUNT') + "<br />" },
                    unique: { invalid: false, errorMessage: $translate.instant('SOFTPROFILE_QUESTIONS_ORDERS_MUST_HAVE_UNIQUE_VALUES') + "<br />" }
                };
                
                if (_.any(questions, function (item) { return item.seqNo > 0; })) {
                    var orderValues = _.countBy(questions, function (question) { return question.seqNo; });
                    _.forEach(questions, function (question) {
                        question.isWrongSecNo = false;
                        if (!question.seqNo) {
                            orderError.zero.invalid = true;
                            question.isWrongSecNo = true;
                        }
                        else if (question.seqNo > questions.length) {
                            orderError.big.invalid = true;
                            question.isWrongSecNo = true;
                        }
                        else if (orderValues[question.seqNo] > 1) {
                            orderError.unique.invalid = true;
                            question.isWrongSecNo = true;
                        }
                    });

                    var notificationMessages = "";

                    if (orderError.zero.invalid) {
                        notificationMessages += orderError.zero.errorMessage;
                        isValid = false;
                    }
                    if (orderError.big.invalid) {
                        notificationMessages += orderError.big.errorMessage;
                        isValid = false;
                    }
                    if (orderError.unique.invalid) {
                        notificationMessages += orderError.unique.errorMessage;
                        isValid = false;
                    }

                    if(!isValid){
                        dialogService.showNotification(notificationMessages, "error");
                    }
                }
                else {
                    _.forEach(questions, function (question) { question.isWrongSecNo = false; });
                }

                return isValid;
            }
        }]);