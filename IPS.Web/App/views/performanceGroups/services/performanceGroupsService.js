(function () {
    'use strict';

    angular
        .module('ips.performanceGroups')
        .service('performanceGroupsService', ['apiService', '$q', 'progressBar', '$translate', function (apiService, $q, progressBar, $translate) {
            var performanceGroups = new kendo.data.ObservableArray([]);

            this.init = function () {

            }

            this.load = function (query, profileTypeId) {

                if (!query) {
                    query = "";
                }
                if (profileTypeId) {
                    query += "&profileTypeId=" + profileTypeId;
                }
                progressBar.startProgress();
                return apiService.getAll("Performance_groups?$orderby=Name&$expand=Link_PerformanceGroupSkills($expand=Skill,Skill1,Trainings,Questions($expand=AnswerType,PossibleAnswer)),Industry,StructureLevel,Profile,ProfileTypes,JobPositions" + query).then(function (data) {
                    progressBar.stopProgress();
                    performanceGroups.splice(0, performanceGroups.length);

                    angular.forEach(data, function (pg, index1) {
                        pg.skills = [];
                        angular.forEach(pg.link_PerformanceGroupSkills, function (pgs, index2) {
                            if (pgs.skill1) {
                                pg.skills.push(pgs.skill1);
                            } else {
                                pg.skills.push(pgs.skill);
                            }
                        });
                        performanceGroups.push(pg);
                    });


                    return performanceGroups;
                });
            }

            this.getAllPerformanceGroups = function (query, profileTypeId) {
                if (!query) {
                    query = "";
                }
                if (profileTypeId) {
                    query += "&profileTypeId=" + profileTypeId;
                }

                return apiService.getAll("Performance_groups?$orderby=Name&$expand=Link_PerformanceGroupSkills($expand=Skill,Skill1,Trainings),Industry,StructureLevel,Profile,ProfileTypes,JobPositions" + query).then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_PERFORMANCE_GROUP') });
                    return data;
                });
            };

            this.getOrganizations = function () {
                return apiService.getAll("organization?$select=Id,Name&$expand=Departments($select=Id,Name),Teams($select=Id,Name),Users($select=Id,FirstName,LastName)").then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_ORGANIZATION') });
                    return data;
                });
            }

            this.getIndustries = function () {
                // $filter=ParentId eq null&
                return apiService.getAll("industries?$select=Id,Name&$orderby=Name&$expand=SubIndustries").then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_INDUSTRY') });
                    return data;
                });
            };

            this.getProfileLevels = function () {
                return apiService.getAll("Profile_Levels?$select=Id,Name&$orderby=Name").then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_PROFILE_LEVEL') });
                    return data;
                });
            };

            this.getPerspectives = function (organizationId) {
                return apiService.getAll("perspectives?$select=Id,Name&$orderby=Name&$filter=(OrganizationId eq null)or(OrganizationId eq " + organizationId + ")").then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_PERSPECTIVES') });
                    return data;
                });
            };

            this.getObjectives = function (organizationId) {
                return apiService.getAll("objectives?$orderby=Title&$filter=OrganizationId eq " + organizationId).then(function (data) {
                    return data;
                });
            };

            this.getScales = function () {
                return apiService.getAll("scales?$expand=ScaleRanges,ScaleCategory,ProfileType1&$filter=(ProfileType eq 1 or ProfileType eq null) and IsTemplate eq true").then(function (data) {
                    return data;
                });
            };

            this.getMainSkills = function (orgId) {
                return apiService.getAll("skills?$orderby=Name&$filter=(ParentId eq null)and((OrganizationId eq " + orgId + ")or(OrganizationId eq null))and(IsTemplate eq true)").then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_SKILL') });
                    return data;

                })

            }

            this.getSkills = function () {
                return apiService.getAll("skills?$orderby=Name&$filter=IsTemplate eq true").then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_SKILL') });
                    return data;

                })

            }

            this.getSkills = function (profileTypeId) {
                return apiService.getAll("Skills?$expand=Skill1&$orderby=Name&$filter=((ProfileTypeId eq null)or(ProfileTypeId eq " + profileTypeId + "))and((ParentId eq null)or(Skill1/ProfileTypeId eq null)or(Skill1/ProfileTypeId eq " + profileTypeId + "))").then(function (data) {
                    //data.unshift({ id: null, name: "root", parentId: "0" });
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_SKILL'), parentId: "0" });
                    return data;
                });
            }

            this.getTrainingTemplatesBySkill = function (skillId) {
                return apiService.getById("trainings/getTrainingTemplatesBySkill", skillId).then(function (data) {
                    return data;
                });
            }

            this.getTrainingById = function(trainingId) {
                var deferred = $q.defer();
                var apiName = 'tasks/getTrainingById/' + trainingId;
                apiService.getAll(apiName, null).then(function (data) {
                    deferred.resolve(data);
                }, function (data) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            this.getProfileSkills = function (profileId) {
                return apiService.getById("skills/getProfileSkills", profileId).then(function (data) {
                    return data;
                })
            }


            this.getProfileQuestions = function (profileId) {
                return apiService.getById("questions/getProfileQuestions", profileId).then(function (data) {
                    return data;
                })

            }

            this.addPerformanceGroupSkill = function (performanceGroupId, skills) {
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

            this.getTrainingTypes = function () {
                return apiService.getAll("trainingTypes?$orderby=Name").then(function (data) {
                    angular.forEach(data, function (key, value) {
                        key.text = key.name;
                        key.value = key.id;
                    });
                    data.unshift({ name: $translate.instant('SOFTPROFILE_SELECT_TYPE'), id: null, text: "", value: null });
                    return data;
                });
            }

            this.getTrainingLevels = function () {
                return apiService.getAll("TrainingLevels?$orderby=Name").then(function (data) {

                    angular.forEach(data, function (key, value) {
                        key.text = key.name;
                        key.value = key.id;
                    });
                    data.unshift({ name: $translate.instant('SOFTPROFILE_SELECT_LEVEL'), id: null, text: "", value: null });
                    return data;
                });
            }



            this.getDurationMetrics = function () {
                return apiService.getAll("DurationMetric/GetDDL").then(function (data) {
                    return data;
                });
            }
            this.getExerciseMetrics = function () {
                return apiService.getAll("ExerciseMetric/GetDDL").then(function (data) {
                    return data;
                });
            }
            this.add = function (item) {
                performanceGroups.push(item);
            };

            this.update = function (item) {
                var index = performanceGroups.indexOf(item);
                if (index >= 0) {
                    performanceGroups.splice(index, 1, item);
                }
            };

            this.get = function (index) {

                return performanceGroups[index];
            };

            this.getById = function (id, profileId) {
                if (id > 0) {
                    return apiService.getById("Performance_groups", id, "$expand=ScorecardGoals,Link_PerformanceGroupSkills($expand=Skill,Skill1,Questions($expand=AnswerType),Trainings($expand=Skills,TrainingMaterials)),PerformanceGroups1,Scale($expand=ScaleRanges),Profile,ProfileTypes,JobPositions,Industry").then(function (data) {
                        data.viewName = data.name;
                        return data;
                    });
                } else {

                    var pg = {
                        id: -1,
                        name: "",
                        viewName: $translate.instant('SOFTPROFILE_NEW_PERFORMANCE_GROUP'),
                        description: "",
                        organizationId: null,
                        isTemplate: true,
                        parentId: null,
                        levelId: null,
                        rootIndustryId: null,
                        subIndustryId: null,
                        industry: null,
                        scorecardPerspectiveId: null,
                        scorecardGoals: [],
                        isActive: true,
                        seqNo: null,
                        scaleId: null,
                        scale: {
                            id: "",
                            name: "",
                            description: "",
                            scaleCategoryId: undefined,
                            measureUnitId: undefined,
                            profileType: undefined,
                            isTemplate: true,
                            scaleCategory: {},
                            measureUnit: {},
                            profileType1: {}
                        },
                        Link_PerformanceGroupSkills: [],
                        goals: [],
                        questions: [],
                        trainings: [],
                        profile: null,
                        profileId: null

                    };

                    if (profileId) {
                        return apiService.getById("profiles", profileId, "$expand=Scale($expand=ScaleRanges),Industry,JobPositions").then(function (data) {
                            pg.profile = data;
                            pg.profileId = data.id;
                            pg.organizationId = data.organizationId;
                            pg.levelId = data.levelId;
                            pg.industryId = data.industryId;
                            pg.industry = data.industry;
                            pg.isTemplate = false;
                            return pg;
                        });
                    } else {
                        return pg;
                    }

                }
            };

            this.remove = function (index) {
                return performanceGroups.splice(index, 1);
            };

            this.clone = function (id) {
                var apiName = "performance_groups/clone/" + id;
                return apiService.update(apiName).then(function (data) {
                    return data;
                },
                    function (data) {
                        return data;
                    });
            }

            this.list = function () {
                return performanceGroups;
            };

            this.dataSource = function () {
                return new kendo.data.DataSource({
                    type: "json",
                    data: performanceGroups,
                    pageSize: 10,
                    //sort: { field: "seqNo", dir: "asc" },
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                name: { type: 'string' },
                                description: { type: 'string' },
                            }
                        }
                    }
                });
            }
            this.trainingDataSource = function (pgid) {
                var ds = [];
                var pg = _.filter(performanceGroups, function (item) {
                    return item.id == pgid
                });
                if (pg.length > 0) {
                    pg = pg[0];
                }
                _.forEach(pg.link_PerformanceGroupSkills, function (item) {
                    _.forEach(item.trainings, function (training) {
                        ds.push(training);
                    })
                })
                return new kendo.data.DataSource({
                    type: "json",
                    data: ds,
                    pageSize: 10,
                    //sort: { field: "seqNo", dir: "asc" },
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                name: { type: 'string' },
                                what: { type: 'string' },
                                why: { type: 'string' },
                                how: { type: 'string' },
                                additionalInfo: { type: 'string' },
                            }
                        }
                    }
                });
            }

            this.addSkillFromTamplateDialog = function (orgId, profileTypeId) {
                var deferred = $q.defer();

                $('#addSkillFromTamplateDialogWindow').remove();
                $(".k-ext-treeview").remove();

                var html =
                    '<div id="addSkillFromTamplateDialogWindow"> ' +
                    '<div style="text-align: center; width:100%"> ' +
                    '<div class="row" style="text-align: left; width:100%">' +
                    '<div class="col-md-12">' +
                    '<div class="form-group">' +
                    '   <div class="control-label" style="margin:10px 0 15px 0;font-weight: bold;">Main Skill</div> ' +
                    '   <div id="skillTemplatesDropDown" style="width: 280px"></div> ' +
                    '</div>' +
                    '</div>' +
                    '<div class="col-md-12">' +
                    '<div class="form-group">' +
                    '   <div class="control-label" style="margin:10px 0 15px 0;font-weight: bold;">Sub Skill</div> ' +
                    '   <div id="subSkillDropDown"></div> ' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '   <div id="selectableGrid" style="text-align: left; width:100%; "></div> ' +
                    '   <button class="btn btn-cstm primary cancel pull-right" id="addSkillFromTamplateDialogWindowCancelButton"">Cancel</button> ' +
                    '   <button class="btn btn-cstm primary pull-right" id="addSkillFromTamplateDialogWindowOkButton">Ok</button> ' +
                    '   </div> ' +
                    '</div> ';

                $('body').append(html);

                var windowDiv = $('#addSkillFromTamplateDialogWindow');
                windowDiv.kendoWindow({
                    width: "300px",
                    title: $translate.instant('SOFTPROFILE_SELECT_SKILL_POPUP'),
                    modal: true,
                    visible: false
                });

                var dialog = windowDiv.data("kendoWindow");
                var skill = null;
                var skillDropDown = $("#skillTemplatesDropDown").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    //width: 250,
                    dataSource: {
                        transport: {
                            read: function (options) {
                                apiService.getAll("skills?$orderby=Name&$filter=(ParentId eq null)and(ProfileTypeId eq " + profileTypeId + " or ProfileTypeId eq null)and((OrganizationId eq " + orgId + ")or(OrganizationId eq null))and(IsTemplate eq true)").then(function (data) {
                                    if (data && data.length > 0) {
                                        skill = data[0];
                                    }
                                    options.success(data);
                                })
                            },
                        }
                    }
                }).data("kendoDropDownList");
                //skillDropDown.element.css("width", "100%");
                //skillDropDown.list.width("100%");

                var dropDownTreeView = $("#subSkillDropDown").data("kendoExtDropDownTreeView");

                dropDownTreeView = $("#subSkillDropDown").kendoExtDropDownTreeView({
                    treeview: {
                        dataTextField: "name",
                        dataValueField: "id",
                        dataSource: kendo.observableHierarchy([]),
                        loadOnDemand: false
                    },
                }).data("kendoExtDropDownTreeView");
                var subSkill = null;
                dropDownTreeView.bind("select", function (e) {
                    subSkill = this._treeview.dataItem(e.node);
                });


                var treeview = dropDownTreeView._treeview;
                var dropdown = dropDownTreeView._dropdown;

                var $dropdownRootElem = $(dropdown.element).closest("span.k-dropdown");
                $dropdownRootElem.css("width", "280px");

                var $treeviewRootElem = $(treeview.element).closest("div.k-treeview");
                $treeviewRootElem.css("width", "280px");
                $treeviewRootElem.css("height", "200px");

                treeview.expand(".k-item");

                dropdown.text('Select Sub Skill');

                $(dropdown).prop("disabled", true);


                skillDropDown.bind("select", function (e) {
                    skill = this.dataItem(e.item);

                    var processTable = function (data, idField, foreignKey, rootLevel) {
                        var hash = {};

                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            item.text = item.name;
                            var id = item[idField];
                            var parentId = item[foreignKey];

                            hash[id] = hash[id] || [];
                            hash[parentId] = hash[parentId] || [];

                            item.items = hash[id];
                            hash[parentId].push(item);
                        }
                        return hash[rootLevel];
                    }

                    apiService.getAll("skills").then(function (data) {
                        var treeData = processTable(data, "id", "parentId", skill.id);

                        if (dropDownTreeView) {

                            dropDownTreeView._treeview.setDataSource(kendo.observableHierarchy(treeData));

                            //if(treeData.length > 0)
                            //{
                            //    $(dropdown).prop("disabled", false);

                            //}
                            //else{
                            //    $(dropdown).prop("disabled", true);
                            //}
                        }
                        else {

                        }

                        dropdown.text('Select Sub Skill');
                    })
                });


                $('#addSkillFromTamplateDialogWindowOkButton').click(function (e) {
                    dialog.close();
                    $('#addSkillFromTamplateDialogWindow').remove();
                    $(".k-ext-treeview").remove();
                    var pgSkill = {
                        skill: skill,
                        subSkill: subSkill,
                        skillName: "",
                        skillDescription: "",
                        subSkillName: "",
                        subSkillDescription: "",
                        ranges: [],
                        benchmark: 0,
                        weight: 0,
                        csf: '',
                        actions: ''
                    };

                    if (pgSkill.skill) {
                        pgSkill.skillName = pgSkill.skill.name;
                        pgSkill.skillDescription = pgSkill.skill.description;
                        if ((pgSkill.skill.scale) && (pgSkill.skill.scale.scaleRanges)) {
                            pgSkill.ranges = pgSkill.skill.scale.scaleRanges
                        }
                        pgSkill.skillId = pgSkill.skill.id;
                        pgSkill.name = pgSkill.skill.name;
                    } else {
                        pgSkill.skillId = null;
                    }

                    if (pgSkill.subSkill) {
                        pgSkill.subSkillName = pgSkill.subSkill.name;
                        pgSkill.subSkillDescription = pgSkill.subSkill.description;

                        if ((pgSkill.subSkill.scale) && (pgSkill.subSkill.scale.scaleRanges)) {
                            pgSkill.ranges = pgSkill.subSkill.scale.scaleRanges
                        }

                        pgSkill.subSkillId = pgSkill.subSkill.id;
                        pgSkill.name = pgSkill.subSkill.name;
                    } else {
                        pgSkill.subSkillId = null;
                    }

                    pgSkill.id = pgSkill.skillId + "_" + pgSkill.subSkillId;

                    deferred.resolve(pgSkill);
                });

                $('#addSkillFromTamplateDialogWindowCancelButton').click(function (e) {
                    dialog.close();
                    $('#addSkillFromTamplateDialogWindow').remove();
                    $(".k-ext-treeview").remove();
                    deferred.reject();
                });

                dialog.center();
                dialog.open();

                return deferred.promise;
            }

            this.updatePerformanceGroupOrder = function (performanceGroupId, value) {

                return apiService.update("performance_groups/" + performanceGroupId + "/order/" + value).then(function (data) {
                    return data;
                },
                    function (data) {
                        return data;
                    });
            }

            this.updateQuestionsOrder = function (questionId, value) {

                return apiService.update("Questions/" + questionId + "/order/" + value).then(function (data) {
                    return data;
                },
                    function (data) {
                        return data;
                    });
            }

            this.prepageQuestions = function (skills) {

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
            this.getNotificationTemplates = function () {
                var deferred = $q.defer();
                var apiName = 'NotificationTemplates/GetDDL';
                apiService.getAll(apiName, "").then(function (data) {
                    deferred.resolve(data);
                },
                    function (data) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            }
            function clearQuestions() {
                if (questions.length > 0) {
                    questions.splice(0, questions.length);
                }
            }


        }])


})();
