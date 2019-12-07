(function () {
    'use strict';

    angular
        .module('ips.profiles')

        .factory('softProfileManager', softProfileManager);

    softProfileManager.$inject = ['$q', 'apiService', '$state'];

    function softProfileManager($q, apiService, $state) {

        var allStages = new kendo.data.ObservableArray([]);
        var stagesAndAlarms = new kendo.data.ObservableArray([]);

        var self = {
            addNewPerformanceGroup: function (performanceGroups) {
                return $q.when(addNewPerformanceGroup(performanceGroups));
            },
            addPerformanceGroupSkill: function (performanceGroupId, skills) {
                return $q.when(addPerformanceGroupSkill(performanceGroupId, skills));
            },
            addNewQuestion: function (newQuestion) {
                return $q.when(addNewQuestion(newQuestion));
            },
            addPerformanceGroupQuestion: function (performanceGroupId, allQuestion) {
                return $q.when(addPerformanceGroupQuestion(performanceGroupId, allQuestion));
            },
            saveAllPerformanceGroupSkills: function (link_PerformanceGroupSkills) {
                return $q.when(saveAllPerformanceGroupSkills(link_PerformanceGroupSkills));
            }
        };

        return self;



        function addNewPerformanceGroup(performanceGroups) {
            var deferred = $q.defer();
            var apiName = 'Performance_groups';
            apiService.add(apiName, performanceGroups).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function addPerformanceGroupSkill(performanceGroupId, skills) {
            var deferred = $q.defer();
            var apiName = "Performance_groups/" + performanceGroupId + "/newskills";
            apiService.update(apiName, skills).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }



        function addNewQuestion(newQuestion) {
            var deferred = $q.defer();
            var apiName = "questions";
            apiService.add(apiName, newQuestion).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function addPerformanceGroupQuestion(performanceGroupId, allQuestion) {

            var deferred = $q.defer();
            var apiName = "Performance_groups/" + performanceGroupId + "/newquestions";
            apiService.update(apiName, allQuestion).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function saveAllPerformanceGroupSkills(performanceGroup, id) {
            angular.forEach(performanceGroup.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                setTimeout(function () {
                    link_PerformanceGroupSkillItem.performanceGroupId = id;
                    console.log("newskills" + link_PerformanceGroupSkillItem.id);
                    var skillIds = [link_PerformanceGroupSkillItem];
                    console.log("addPerformanceGroupSkill  " + new Date());
                    var isProcessed = false;
                    var deferred = $q.defer();
                    var apiName = "Performance_groups/" + performanceGroup.id + "/newskills";
                    $q.when(addPerformanceGroupSkill(performanceGroup.id, skillIds)).then(function (skilldata) {
                        console.log("addPerformanceGroupSkill  Success" + new Date());
                        link_PerformanceGroupSkillItem.id = skilldata[0].id;
                        link_PerformanceGroupSkillItem.skill.id = skilldata[0].skillId;
                        link_PerformanceGroupSkillItem.skillId = skilldata[0].skillId;
                        //if (link_PerformanceGroupSkillItem.questions) {
                        //    _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                        //        questionsItem.skillId = link_PerformanceGroupSkillItem.skillId;
                        //        questionsItem.performanceGroupId = performanceGroup.id;
                        //        prepareQuesionTimeBeforeSave(questionsItem);
                        //        $scope.newQuestion = {
                        //            id: 0,
                        //            questionText: questionsItem.questionText,
                        //            description: questionsItem.description,
                        //            answerTypeId: questionsItem.answerTypeId,
                        //            isActive: true,
                        //            isTemplate: false,
                        //            organizationId: $scope.currentUser.organizationId,
                        //            profileTypeId: $scope.profile.profileTypeId,
                        //            scaleId: $scope.profile.scaleId,
                        //            questionSettings: $scope.profile.questionDisplayRuleId,
                        //            structureLevelId: $scope.profile.levelId,
                        //            industryId: $scope.profile.industryId,
                        //            seqNo: questionsItem.seqNo,
                        //            points: questionsItem.points,
                        //            timeForQuestion: questionsItem.timeForQuestion,
                        //            parentQuestionId: questionsItem.parentQuestionId,
                        //            possibleAnswer: questionsItem.possibleAnswer,
                        //            performanceGroupId: questionsItem.performanceGroupId,
                        //            skillId: questionsItem.skillId,
                        //        };

                        //        console.log("addNewQuestion " + new Date());

                        //        softProfileManager.addNewQuestion($scope.newQuestion).then(function (questiondata) {
                        //            console.log("addNewQuestion  Success" + new Date());
                        //            questionsItem.id = questiondata;
                        //            var allQuestion = [];
                        //            allQuestion.push({
                        //                skillId: link_PerformanceGroupSkillItem.skillId,
                        //                questionId: questiondata,
                        //                seqNo: parseInt($scope.newQuestion.seqNo),
                        //            });
                        //            console.log("addPerformanceGroupQuestion " + new Date());

                        //            softProfileManager.addPerformanceGroupQuestion(item.id, allQuestion).then(function (data) {
                        //                console.log("addPerformanceGroupQuestion  Success" + new Date());

                        //                questionsItem.id = data[0].questionId;
                        //                //dialogService.showNotification('Performance group saved successfully', 'info');
                        //            }, $scope.showError)


                        //        },
                        //            function (data) {
                        //                return null;
                        //            });
                        //    })
                        //}
                        //if (link_PerformanceGroupSkillItem.trainings) {
                        //    _.each(link_PerformanceGroupSkillItem.trainings, function (trainingItem) {
                        //        var NewTrainingItem = {
                        //            id: 0,
                        //            name: trainingItem.name,
                        //            typeId: trainingItem.typeId,
                        //            levelId: trainingItem.levelId,
                        //            why: trainingItem.why,
                        //            what: trainingItem.what,
                        //            how: trainingItem.how,
                        //            additionalInfo: trainingItem.additionalInfo,
                        //            duration: 30,
                        //            durationMetricId: trainingItem.durationMetricId,
                        //            frequency: trainingItem.frequency,
                        //            howMany: trainingItem.howMany,
                        //            exerciseMetricId: trainingItem.exerciseMetricId,
                        //            howManySets: trainingItem.howManySets,
                        //            howManyActions: trainingItem.howManyActions,
                        //            isActive: true,
                        //            organizationId: $scope.currentUser.organizationId,
                        //            trainingMaterial: null,
                        //            trainingMaterials: new kendo.data.ObservableArray([]),
                        //            userId: $scope.userId,
                        //            skillId: link_PerformanceGroupSkillItem.skillId,
                        //            notificationTemplateId: null,
                        //            isNotificationByEmail: true,
                        //            emailNotificationIntervalId: null,
                        //            emailBefore: null,
                        //            isNotificationBySMS: false,
                        //            smsNotificationIntervalId: null,
                        //            performanceGroupId: performanceGroup.id
                        //        }

                        //        var skill = null;
                        //        var skill = link_PerformanceGroupSkillItem;
                        //        if (skill.skill1) {
                        //            NewTrainingItem.skills = [skill.skill1];
                        //            NewTrainingItem.skill = skill.skill1;
                        //            NewTrainingItem.skillId = skill.skill1.id;
                        //            NewTrainingItem.skillName = skill.skill1.name;
                        //        } else if (skill.subSkill) {
                        //            NewTrainingItem.skills = [skill.subSkill];
                        //            NewTrainingItem.skill = skill.subSkill;
                        //            NewTrainingItem.skillId = skill.subSkill.id;
                        //            NewTrainingItem.skillName = skill.subSkill.name;
                        //        } else {
                        //            NewTrainingItem.skills = [skill.skill];
                        //            NewTrainingItem.skill = skill.skill;
                        //            NewTrainingItem.skillId = skill.skill.id;
                        //            NewTrainingItem.skillName = skill.skill.name;
                        //        }
                        //        if (trainingItem.trainingMaterials) {
                        //            _.each(trainingItem.trainingMaterials, function (tm) {
                        //                var newTM = _.clone(tm);
                        //                newTM.id = 0;
                        //                newTM.trainingId = 0;
                        //                NewTrainingItem.trainingMaterials.push(newTM);
                        //            });
                        //        }
                        //        profileTrainingManager.addNewTraining(NewTrainingItem).then(function (data) {
                        //            NewTrainingItem.id = data.id;


                        //            if (NewTrainingItem.id > 0) {

                        //                var trainingIds = [];
                        //                trainingIds.push({ trainingId: NewTrainingItem.id, skillId: NewTrainingItem.skillId });

                        //                profileTrainingManager.SetPerformanceGroupTraining(NewTrainingItem.performanceGroupId, trainingIds).then(function (data) {
                        //                    if (data) {
                        //                        _.each($scope.profile.performanceGroups, function (item) {
                        //                            if (item.id == NewTrainingItem.performanceGroupId) {
                        //                                _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                        //                                    if (pgSkillItem.skillId == NewTrainingItem.skillId) {
                        //                                        pgSkillItem.trainings.push(NewTrainingItem);
                        //                                    }
                        //                                });
                        //                            }
                        //                        });
                        //                        dialogService.showNotification('Training saved successfully', 'info');
                        //                    }
                        //                });
                        //                //$state.go('^');
                        //            } else {
                        //                dialogService.showNotification('save failed', 'warning');
                        //            }
                        //        }, function (error) {
                        //            dialogService.showNotification(error, "warning");
                        //        });



                        //    })
                        //}
                    });
                    console.log("next addPerformanceGroupSkill  " + new Date());
                }, 10000);
            })

        }
    }

})();