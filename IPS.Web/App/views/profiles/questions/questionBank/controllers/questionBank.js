(function () {
    'use strict';

    angular
        .module('ips.questions')

        .config(['$stateProvider', '$urlRouterProvider', 'profilesTypesEnum',
            function ($stateProvider, $urlRouterProvider, profilesTypesEnum) {
                var baseResolve = {
                    pageName: function ($translate) {
                        return $translate.instant('SOFTPROFILE_QUESTION_BANK');
                    },

                    skills: function (apiService) {
                        var apiName = 'skills?$orderby=Name';
                        return apiService.getAll(apiName).then(function (data) {
                            return data;
                        })
                    },

                    industries: function (apiService) {
                        var apiName = 'industries?$expand=SubIndustries';
                        return apiService.getAll(apiName).then(function (data) {
                            return data;
                        })
                    },

                    organizations: function (organizationManager) {
                        var query = '?$select=Id,Name';
                        return organizationManager.getOrganizations(query).then(function (data) {
                            return data;
                        })
                    },

                    structureLevels: function (apiService) {
                        var apiName = 'profile_levels';
                        return apiService.getAll(apiName).then(function (data) {
                            return data;
                        })
                    },

                    answerTypes: function (apiService) {
                        return null;
                    }
                };
                var softResolve = _.clone(baseResolve);
                softResolve.profileTypeId = function () {
                    return profilesTypesEnum.soft;
                };
                softResolve.profileType = function () {
                    return "soft";
                };

                var ktResolve = _.clone(baseResolve);
                ktResolve.profileTypeId = function () {
                    return profilesTypesEnum.knowledgetest;
                };
                ktResolve.profileType = function () {
                    return "knowledgetest";
                };
                ktResolve.answerTypes = function (apiService) {
                    var apiName = 'answerTypes';
                    return apiService.getAll(apiName).then(function (data) {
                        return data;
                    })
                };


                $stateProvider
                    .state('home.profiles.soft.questionbank', {
                        url: "/questionbank",
                        templateUrl: "views/profiles/questions/questionBank/views/questionBank.html",
                        controller: "questionBankCtrl",
                        resolve: softResolve,
                        data: {
                            displayName: '{{pageName}}',//'Question Bank',
                            paneLimit: 1,
                            depth: 3,
                            resource: "Profiles"
                        }
                    })
                    .state('home.profiles.knowledgetest.questionbank', {
                        url: "/questionbank",
                        templateUrl: "views/profiles/questions/questionBank/views/questionBank.html",
                        controller: "questionBankCtrl",
                        resolve: ktResolve,
                        data: {
                            displayName: '{{pageName}}',//'Question Bank',
                            paneLimit: 1,
                            depth: 3,
                            resource: "Profiles"
                        }
                    });
            }])

        .controller('questionBankCtrl', questionBankCtrl);

    questionBankCtrl.$inject = ['$scope', '$state', 'cssInjector', 'progressBar', 'skills', 'industries', 'organizations', 'structureLevels', 'profilesTypesEnum',
        'questionBankManager', 'authService', 'apiService', 'dialogService', 'profilesService', 'profileType', 'profileTypeId', 'answerTypes', '$translate'];

    function questionBankCtrl($scope, $state, cssInjector, progressBar, skills, industries, organizations, structureLevels, profilesTypesEnum,
        questionBankManager, authService, apiService, dialogService, profilesService, profileType, profileTypeId, answerTypes, $translate) {
        cssInjector.removeAll();
        $scope.authService = authService;
        $scope.questions = new kendo.data.ObservableArray([]);
        var profileTypeId = profileTypeId;

        $scope.questionTypes = answerTypes;
        $scope.private = {
            getById: function (id, myArray) {
                if (myArray.filter) {
                    return myArray.filter(function (obj) {
                        if (obj.id == id) {
                            return obj
                        }
                    })[0]
                }
                return undefined;
            },
            processTable: function (data, idField, foreignKey, rootLevel) {
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
        }

        cssInjector.add('views/profiles/questions/questionBank/questionBank.css');

        $scope.gridoptions = new kendo.data.DataSource({
            type: "json",
            data: $scope.questions,
            pageSize: 10,
            sort: {
                field: "questionText",
                dir: "asc"
            }
        });

        $scope.organizations = organizations.sort(sortByName);
        $scope.selectedQuestion;
        $scope.structureLevels = structureLevels;
        $scope.industries = industries;
        $scope.subIndustries = [];

        function sortByName(a, b) {
            var aName = a.name.toLowerCase();
            var bName = b.name.toLowerCase();
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        }

        skills.push({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_SKILL'), parentId: "0" });

        $scope.treeSkillsData = new kendo.data.HierarchicalDataSource({
            data: $scope.private.processTable(skills, "id", "parentId", 0)
        });

        $scope.skillsFlatList = profilesService.flattenSkillsList(skills);

        $scope.filter = {
            isActive: null,
            performanceGroupName: 'Select Performance Group...',
            isInactive: false,
            organizationId: null,
            structureLevelId: null,
            skillId: null,
            industryId: null,
            subIndustryId: null,
            showTemplatesOnly: null,
            questionTypeId: null,
            questionId: null,
        };

        $scope.clone = function (id) {
            apiService.add("questions/clone/" + id, null).then(function (data) {
                $scope.doFilter();
            }, function (message) {
                dialogService.showNotification(message, 'warning');
            });
        }

        function doFilter() {
            progressBar.startProgress();
            var query = "";

            query += "(ProfileTypeId eq " + profileTypeId + ")";

            if ($scope.filter.organizationId > 0) {
                if (query) {
                    query += "and";
                }
                query += "(OrganizationId eq " + $scope.filter.organizationId + ")";
            }

            if ($scope.filter.isActive) {
                if ($scope.filter.isActive) {
                    if (query) {
                        query += "and";
                    }
                    query += "(IsActive eq " + $scope.filter.isActive + ")";
                }
            }

            if ($scope.filter.showTemplatesOnly) {
                if (query) {
                    query += "and";
                }
                query += "(IsTemplate eq " + $scope.filter.showTemplatesOnly + ")";
            }

            if ($scope.filter.structureLevelId > 0) {
                if (query) {
                    query += "and";
                }
                query += "(StructureLevelId eq " + $scope.filter.structureLevelId + ")";
            }

            if (isKTProfile() && $scope.filter.questionTypeId) {
                if (query) {
                    query += "and";
                }
                query += "(AnswerTypeId eq " + $scope.filter.questionTypeId + ")";
            }

            if ($scope.filter.skillId > 0) {
                if (query) {
                    query += "and";
                }
                query += "(Skills/any(skill : skill/Id eq " + $scope.filter.skillId + "))";
            }

            if ($scope.filter.performanceGroupName != 'Select Performance Group...') {
                if (query) {
                    query += "and";
                }
                query += "(Link_PerformanceGroupSkills/any(j:j/PerformanceGroup/Name eq '" + $scope.filter.performanceGroupName + "'))";
            }

            if ($scope.filter.industryId > 0) {
                if (query) {
                    query += "and";
                }
                if ($scope.filter.subIndustryId > 0) {
                    query += "(IndustryId eq " + $scope.filter.subIndustryId + ")";
                }
                else {
                    query += "(IndustryId eq " + $scope.filter.industryId + " or Industry/ParentId eq " + $scope.filter.industryId + ")";
                }
            }

            if (query) {
                query = "?$expand=Skills,Link_PerformanceGroupSkills($expand=PerformanceGroup),ProfileType,Organization,Industry,StructureLevel&$filter=" + query;
            } else {
                query = "?$expand=Skills,Link_PerformanceGroupSkills($expand=PerformanceGroup),ProfileType,Organization,Industry,StructureLevel";
            }

            questionBankManager.getQuestions(query).then(function (data) {
                progressBar.stopProgress();
                $scope.gridoptions.transport.data.splice(0, $scope.gridoptions.transport.data.length);
                $scope.gridoptions.transport.data.push.apply($scope.gridoptions.transport.data, data);

                $scope.questionsList = data;

                if ($scope.filter.questionId > 0) {

                    var filteredQuestion = _.filter(data, function (dataItem) {
                        return dataItem.Id == $scope.filter.questionId;
                    });

                    $scope.gridoptions.transport.data.splice(0, $scope.gridoptions.transport.data.length);
                    $scope.gridoptions.transport.data.push.apply($scope.gridoptions.transport.data, filteredQuestion);
                }
            })
        }

        function remove(id) {
            if ($scope.selectedQuestion) {
                questionBankManager.removeQuestion($scope.selectedQuestion).then(
                    function (data) {
                        var item = $scope.private.getById($scope.selectedQuestion, $scope.questions);
                        var index = $scope.questions.indexOf(item);
                        $scope.questions.splice(index, 1);
                    }
                );
            }
        }

        function setSelectedId(id) {
            $scope.selectedQuestion = id;
        }

        function isDisabled(organizationId, action) {
            if ($scope['Questions' + organizationId + action] == undefined) {
                $scope['Questions' + organizationId + action] = !authService.hasPermition(organizationId, 'Questions', action);
            }
            return $scope['Questions' + organizationId + action];
        }

        $scope.isDisabled = isDisabled;

        $scope.doFilter = doFilter;

        $scope.addQuestion = questionBankManager.addNewQuestion;

        $scope.editQuestion = questionBankManager.editQuestion;

        $scope.setSelectedId = setSelectedId;

        $scope.remove = remove;

        $scope.getQuestionType = function (answerTypeId) {
            var foundAnswerType = _.find(answerTypes, function (answerType) {
                if (answerType.id == answerTypeId) {
                    return answerType;
                }
            });
            if (foundAnswerType) {
                return foundAnswerType.typeName;
            }
            return '';
        }

        var isKTProfile = function () {
            return profileTypeId == profilesTypesEnum.knowledgetest;
        }
        $scope.isKTProfile = isKTProfile;

        var getQuestionsGridColumns = function () {
            var columns = [];
            columns.push({ field: "questionText", title: $translate.instant('SOFTPROFILE_QUESTION'), width: "15%" });

            if (isKTProfile()) {
                columns.push({
                    field: "answerType",
                    title: $translate.instant('SOFTPROFILE_QUESTION_TYPE'),
                    width: "150px",
                    template: "<div> {{getQuestionType(dataItem.answerTypeId)}} </div>"
                });
            }

            columns.push({
                field: "organization",
                title: $translate.instant('COMMON_ORGANIZATION'),
                width: "160px",
                template: "<div> {{dataItem.organization.name}} </div>"
            });
            columns.push({
                field: "profileType",
                title: $translate.instant('COMMON_PROFILE_TYPE'),
                width: "150px",
                template: "<div> {{dataItem.profileType.name}} </div>"
            });
            columns.push({
                field: "skillnames",
                title: $translate.instant('SOFTPROFILE_SKILLS'),
                width: "110px",
                template: "<div ng-repeat='skill in dataItem.skills'> {{skill.name}} <span ng-hide='!skill.description'> - {{skill.description}}</span> </div>"
            });
            columns.push({
                field: "industry",
                title: $translate.instant('COMMON_INDUSTRY'),
                width: "130px",
                template: "<div> {{dataItem.industry.name}} </div>"
            });
            columns.push({
                field: "structureLevel",
                title: $translate.instant('SOFTPROFILE_TARGET_GROUP_LEVEL'),
                width: "200px",
                template: "<div> {{dataItem.structureLevel.name}} </div>"
            });
            columns.push({
                field: "isActive",
                title: $translate.instant('COMMON_IS_ACTIVE'),
                width: "130px",
                template: '<input type="checkbox" #= isActive ? checked="checked" : "" # disabled="disabled" />'
            });
            columns.push({
                field: "performanceGroup",
                title: $translate.instant('COMMON_PERFORMANCE_GROUP'),
                width: "200px",
                template: "<div ng-repeat='skill in dataItem.link_PerformanceGroupSkills'> {{skill.performanceGroup.name}} </div>"
            });
            columns.push({
                field: "action", title: $translate.instant('COMMON_ACTIONS'), width: "130px", filterable: false, sortable: false, template: function (dataItem) {

                    var res = "<div class='icon-groups'><a class='fa fa-pencil fa-lg' ng-click='editQuestion(" + dataItem.id + ")'></a>";
                    if (!isDisabled(dataItem.organizationId, authService.actions.Create)) {
                        res += "<a class='fa fa-copy fa-lg' ng-click='clone(" + dataItem.id + ");' ></a>";
                    }
                    if (!isDisabled(dataItem.organizationId, authService.actions.Delete)) {
                        res += "<a class='fa fa-trash fa-lg' ng-click='setSelectedId(" + dataItem.id + "); removal.open(" + dataItem.id + ").center()' ></a>";
                    }
                    res += "</div>"

                    return res;
                },
            });
            return columns;
        }

        $scope.questionOptions = {
            dataSource: $scope.gridoptions,
            columnMenu: false,
            filterable: true,
            pageable: true,
            pageSize: 10,
            sortable: true,
            columns: getQuestionsGridColumns(),
        }

        $scope.tooltipOptions = {
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

        $scope.doSearch = function (searchText) {
            $scope.gridInstance.dataSource.filter([
                {
                    logic: "or",
                    filters: [
                        {
                            field: "questionText",
                            operator: "contains",
                            value: searchText
                        },
                        {
                            field: "skillnames",
                            operator: "contains",
                            value: searchText
                        }
                    ]
                }]);
        }

        $scope.$on("kendoRendered", function (event) {
            if (event.targetScope.questionBankGrid) {
                $scope.gridInstance = event.targetScope.questionBankGrid;
            }
        });

        $scope.skillsOptions = {
            placeholder: $translate.instant('SOFTPROFILE_SKILLS'),
            dataTextField: "name",
            dataValueField: "id",
            valuePrimitive: false,
            autoBind: false,
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        options.success(skills);
                    }
                }
            }
        }

        $scope.industiesOptions = {
            placeholder: $translate.instant('SOFTPROFILE_INDUSTRIES'),
            dataTextField: "name",
            dataValueField: "id",
            valuePrimitive: false,
            autoBind: false,
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        options.success(industries);
                    }
                }
            }
        }

        $scope.skillSelected = function (item) {
            $scope.filter.skillId = item.id;
            $scope.doFilter();
        }

        function industryChanged() {
            $scope.subIndustries = [];
            angular.forEach($scope.industries, function (item, index) {
                if (item.id == $scope.filter.industryId) {
                    if (item.subIndustries)
                        $scope.subIndustries = item.subIndustries;
                }

            });

            $scope.filter.subIndustryId = null;
            doFilter();
        }

        $scope.industryChanged = industryChanged;

        $scope.doFilter();
    }

})();