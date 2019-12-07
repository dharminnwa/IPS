'use strict';

angular
    .module('ips.performanceGroups')
    .controller('baseQuestionTabCtrl', ['$scope', 'cssInjector', 'questionTabService', 'questionBankManager', 'dialogService', '$location', 'performanceGroupsService', 'profileTypeId', 'profilesTypesEnum', '$translate',
        function ($scope, cssInjector, questionTabService, questionBankManager, dialogService, $location, performanceGroupsService, profileTypeId, profilesTypesEnum, $translate) {
            cssInjector.add('views/performanceGroups/questionTab.css');
            var vm = $scope;

            $scope.allSkills = $scope.skills;

            vm.subSkills = [];

            vm.newQuestion = {
                questionText: '',
                isActive: true,
                isTemplate: false,
                answerTypeId: 1,
                skills: [],
                profileTypeId: profileTypeId,
                organizationId: vm.performanceGroup.organizationId,
                structureLevelId: vm.performanceGroup.levelId,
                industryId: vm.performanceGroup.industryId
            };
            if (profileTypeId == profilesTypesEnum.knowledgetest) {
                vm.newQuestion.points = 1;
            }

            vm.questionDisplayRule = [
                {
                    id: 1,
                    name: $translate.instant('SOFTPROFILE_PERFORMANCE_GROUP_PER_STEP')
                },
                {
                    id: 2,
                    name: $translate.instant('SOFTPROFILE_QUESTION_PER_STEP')
                },
                {
                    id: 3,
                    name: $translate.instant('SOFTPROFILE_ALL_QUESTIONS_ON_THE_SINGLE_PAGE')
                }
            ]

            vm.questionDisplayRuleId = 1;

            getSkills();

            function addNewQuestion() {
                if (vm.newQuestion.possibleAnswer) {
                    if (!_.isString(vm.newQuestion.possibleAnswer.answer)) {
                        vm.newQuestion.possibleAnswer.answer = JSON.stringify(vm.newQuestion.possibleAnswer.answer);
                    }
                }
                if (vm.newQuestion.subSkillId) {
                    var skill = getById(vm.newQuestion.subSkillId, vm.allSkills, 'subSkillId');
                    vm.newQuestion.skills.push(skill.subSkill);
                    vm.newQuestion.skill = skill.subSkill.name;
                } else {
                    var skill = getById(vm.newQuestion.skillId, vm.allSkills, 'skillId');
                    if (skill.skill) {
                        vm.newQuestion.skills.push(skill.skill);
                        vm.newQuestion.skill = skill.skill.name;
                    }
                    else {
                        skill.id = skill.skillId;
                        vm.newQuestion.skills.push(skill);
                        vm.newQuestion.skill = skill.name;
                    }
                }
                vm.newQuestion.seqNo = 0;
                vm.newQuestion.id = 0;

                questionBankManager.saveQuestion(vm.newQuestion).then(
                    function (data) {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_QUESTION_SAVED_SUCCESSFULLY'), 'info');
                        var newQuestion = createQuestionInstance(data);
                        questionTabService.questions.push(newQuestion);
                        updateQuestionsNumbers(questionTabService.questions);
                        updateSkillsD();
                        vm.newQuestion = {
                            questionText: '',
                            isActive: true,
                            isTemplate: false,
                            answerTypeId: 1,
                            skills: [],
                            subSkillId: '',
                            skillId: '',
                            skillName: '',
                            type: '',
                            seqNo: 0,
                            id: 0,
                            profileTypeId: profileTypeId,
                            organizationId: vm.performanceGroup.organizationId,
                            structureLevelId: vm.performanceGroup.levelId,
                            industryId: vm.performanceGroup.industryId
                        };

                        if (profileTypeId == profilesTypesEnum.knowledgetest) {
                            vm.newQuestion.points = 1;
                            vm.newQuestion.secondsForQuestion = 0;
                            vm.newQuestion.minutesForQuestion = 2;
                        }
                    },
                    function (data) {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_QUESTION_FAILED'), 'warning');
                    }
                );
            }


            function createQuestionInstance(questionId) {
                var skillId = (vm.newQuestion.subSkillId) ? vm.newQuestion.subSkillId : vm.newQuestion.skillId;
                var skillType = (vm.newQuestion.subSkillId) ? 'SS' : "MS";
                var question = {
                    skill: vm.newQuestion.skill,
                    questionId: questionId,
                    skillId: skillId,
                    question: vm.newQuestion.questionText,
                    type: skillType,
                    seqNo: 0,
                    id: 0
                };
                if (profileTypeId == profilesTypesEnum.knowledgetest) {
                    question.answerType = $scope.getQuestionTypeName(vm.newQuestion.answerTypeId);
                    question.points = vm.newQuestion.points;
                }
                return question;
            }

            function getSkills() {
                questionTabService.initializeSkills(vm.allSkills).then(function (data) {
                    vm.skillsD = questionTabService.skills;
                })
            }

            function initializeSubSkills() {
                if (vm.newQuestion.skillId) {
                    if (vm.subSkills.length) {
                        vm.subSkills = [];
                    }

                    for (var i = 0, len = vm.allSkills.length; i < len; i++) {
                        var currentSkill = vm.allSkills[i];
                        if (currentSkill.subSkillId && currentSkill.skillId == vm.newQuestion.skillId) {
                            vm.subSkills.push(
                                {
                                    id: currentSkill.subSkillId,
                                    name: currentSkill.subSkillName
                                }
                            )
                        }
                    }
                }
            }

            function getById(id, myArray, searchParam) {
                (!searchParam) ? searchParam = 'id' : '';
                return myArray.filter(function (obj) {
                    if (obj[searchParam] == id) {
                        return obj
                    }
                })[0]
            }

            function removeQuestion(id) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        var question = getById(id, questionTabService.questions, 'questionId');
                        var index = questionTabService.questions.indexOf(question);
                        questionTabService.questions.splice(index, 1);
                        updateQuestionsNumbers(questionTabService.questions);
                        getSkills();
                        updateSkillsD();
                    },
                    function () {
                    });
            }

            function openAddFromTemplate() {
                var orgCondition, indCondition = '';
                (vm.performanceGroup.organizationId) ? orgCondition = '(OrganizationId eq ' + vm.performanceGroup.organizationId + ' or OrganizationId eq null)and' : '';

                (vm.performanceGroup.industryId) ? indCondition = '(IndustryId eq ' + vm.performanceGroup.industryId + ' or IndustryId eq null)and' : '';

                var getQuery = orgCondition + indCondition + "(ProfileTypeId eq " + profileTypeId + " or ProfileTypeId eq null)and(IsTemplate eq true)and(IsActive eq true)and(";
                angular.forEach(vm.allSkills, function (key, index) {
                    var skillId = key.skillId;
                    if (key.code == 'SS') {
                        skillId = key.skill1Id;
                    }
                    if (skillId) {
                        if (index <= 1) {
                            getQuery += "(Skills/any(s:s/Id eq " + skillId + "))"
                        } else {
                            getQuery += "or(Skills/any(s:s/Id eq " + skillId + "))"
                        }
                    }
                });
                getQuery += ")";

                getQuery += "&$expand=Skills,PossibleAnswer";

                dialogService.showSelectableGridDialog($translate.instant('SOFTPROFILE_SELECT_QUESTIONS'), "questionText", "Questions", "QuestionText", getQuery, [], true).then(
                    function (data) {
                        addSelectedQuestions(data)
                    });
            }

            function addSelectedQuestions(questions) {
                if (questions && questions.length > 0) {
                    for (var i = 0, len = questions.length; i < len; i++) {
                        var currentQuestion = questions[i];
                        var skillType = (currentQuestion.skills[0].parentId) ? 'SS' : "MS";

                        var question = {
                            skill: currentQuestion.skills[0].name,
                            questionId: currentQuestion.id,
                            skillId: currentQuestion.skills[0].id,
                            question: currentQuestion.questionText,
                            type: skillType,
                            seqNo: 0,
                            id: 0
                        };

                        if (currentQuestion.possibleAnswer) {
                            question.possibleAnswer = { answer: currentQuestion.possibleAnswer.answer };
                        }

                        if (!isExisting(questions[i].id)) {
                            questionTabService.questions.push(question)
                        }

                    }
                }

            }

            function isExisting(questionId) {
                var question = getById(questionId, questionTabService.questions, 'questionId');
                return (question);
            }

            function editQuestion(id) {
                $location.path($location.path() + '/editQuestion/' + id);
            }

            vm.editQuestion = editQuestion;

            vm.removeQuestion = removeQuestion;

            vm.initializeSubSkills = initializeSubSkills;

            vm.addNewQuestion = addNewQuestion;

            vm.addQuestionFromTemplate = openAddFromTemplate;

            $scope.validateQuestionsOrder = function () {
                return questionTabService.validateQuestionsOrder();
            }

            var updateQuestionsNumbers = function (questions) {
                _.forEach(questions, function (question, index) {
                    question.number = index + 1;
                });
            }

            var updateSkillsD = function () {
                _.forEach(questionTabService.questions, function (question, index) {
                    var index = _.findIndex(vm.skillsD, function (skill) { return skill.skillId == question.skillId; });
                    if (index > -1) {
                        vm.skillsD.splice(index, 1);
                    }
                });
            }
            vm.gridOptions = {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            questionTabService.prepageQuestions(vm.performanceGroup.link_PerformanceGroupSkills).then(function (data) {
                                updateQuestionsNumbers(questionTabService.questions);
                                updateSkillsD();
                                options.success(questionTabService.questions);
                            })
                        }
                    }
                },
                selectable: false,
                sortable: true,
                columns: [
                    { field: "number", title: '#', width: '20%' },
                    { field: "skill", title: $translate.instant('SOFTPROFILE_SKILL_SUB_SKILL'), width: '30%' },
                    {
                        field: "answerType",
                        title: $translate.instant('SOFTPROFILE_QUESTION_TYPE'),
                        width: '30%',
                        hidden: profileTypeId == profilesTypesEnum.soft
                    },
                    { field: "question", title: $translate.instant('SOFTPROFILE_QUESTION'), width: '30%' },
                    {
                        field: "seqNo",
                        title: $translate.instant('SOFTPROFILE_ORDER'),
                        width: "10%",
                        template: "<input style='width:100%'  ng-disabled=\"isDisabled()\" ng-class=\"{'invalidSeqNo': dataItem.isWrongSecNo}\"" +
                        "ng-change='validateQuestionsOrder()'  class='order#= id #' type='number' min='0' ng-model=\"dataItem.seqNo\"/>"
                    },
                    {
                        field: "action", title: $translate.instant('COMMON_ACTIONS'), width: '20%', template: "<div class='icon-groups'>" +
                        "<a class='icon-groups icon-groups-item edit-icon' ng-click='editQuestion(dataItem.questionId)' ng-disabled=\"isDisabled()\"></a>" +
                        "<a class='icon-groups icon-groups-item remove-icon' ng-click='removeQuestion(dataItem.questionId)' ng-disabled=\"isDisabled()\"></a>" +
                        "</div>"
                    }
                ]
            }

            vm.tooltipOptions = {
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
            };
        }]);