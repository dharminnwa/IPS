'use strict';

angular
    .module('ips.questions')
    .service('questionBankManager', ['$q', 'apiService', '$state', '$location', '$stateParams', '$filter',
        function ($q, apiService, $state, $location, $stateParams, $filter) {

            this.getQuestions = function (query) {
                return $q.when(getQuestions(query));
            };

            this.getQuestionById = function (id, query) {
                return $q.when(getQuestionById(id, query));
            },

                this.searchQuestions = function (filterOptions) {
                    return $q.when(searchQuestions(filterOptions));
                };

            this.saveQuestion = function (question) {
                return $q.when(saveQuestion(question));
            };

            this.updateQuestion = function (question) {
                return $q.when(updateQuestion(question));
            };

            this.removeQuestion = function (id) {
                return $q.when(removeQuestion(id));
            };

            this.addNewQuestion = addNewQuestion;

            this.editQuestion = editQuestion;

            this.goToEditPage = goToEditPage;

            this.returnToPerviousPage = returnToPerviousPage;

            this.getParentSkillsNames = function (skills) {
                return $q.when(getParentSkillsNames(skills))
            };

            this.isProfileInUse = function (questionId) {
                var deferred = $q.defer();
                apiService.getAll("questions/" + questionId + "/profile_in_use", "").then(function (data) {
                        deferred.resolve(data);
                    },
                    function (data) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            };

            function getQuestions(query) {
                var deferred = $q.defer();
                var apiName = 'questions';
                (query) ? '' : query = '';
                apiService.getAll(apiName, query).then(function (data) {
                    prepareQuestionsTimeAfterGet(data);
                    deferred.resolve(data);
                    },
                    function (data) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            }

            function getQuestionById(id, query) {
                var deferred = $q.defer();
                var apiName = 'questions';
                (query) ? '' : query = '';
                apiService.getById(apiName, id, query).then(function (data) {
                    prepareQuestionTimeAfterGet(data);
                    deferred.resolve(data);
                    },
                    function (data) {
                        deferred.reject(data);
                    });
                return deferred.promise.then(function (data) {
                    if (data.possibleAnswer) {
                        data.possibleAnswer.answer = JSON.parse(data.possibleAnswer.answer);
                    }
                    return data;
                });
            }

            function prepareQuestionsTimeAfterGet(questions) {
                _.forEach(questions, function (question) {
                    prepareQuestionTimeAfterGet(question);
                });
            }

            function prepareQuestionTimeAfterGet(question) {
                if (question.timeForQuestion) {
                    question.minutesForQuestion = Math.floor(question.timeForQuestion / 60);
                    question.secondsForQuestion = question.timeForQuestion % 60;
                }
            }

            function searchQuestions(filterOptions) {
                var deferred = $q.defer();
                var apiName = 'questions/search?$expand=Skills,Link_PerformanceGroupSkills($expand=PerformanceGroup),ProfileType,Organization,Industry,StructureLevel';
                apiService.add(apiName, filterOptions).then(function (data) {
                        deferred.resolve(data);
                    },
                    function (data) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            }

            function saveQuestion(question) {
                var deferred = $q.defer();
                var apiName = 'questions';
                
                prepareQuesionTimeBeforeSave(question);

                apiService.add(apiName, question).then(function (data) {
                        deferred.resolve(data);
                    },
                    function (data) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            }

            function updateQuestion(question) {
                var deferred = $q.defer();
                var apiName = 'questions';

                prepareQuesionTimeBeforeSave(question);

                apiService.update(apiName, question).then(function (data) {
                        deferred.resolve(data);
                    },
                    function (data) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            }

            function prepareQuesionTimeBeforeSave(question) {
                question.timeForQuestion = 0
                question.timeForQuestion += question.minutesForQuestion * 60;
                question.timeForQuestion += question.secondsForQuestion;
            }

            function removeQuestion(id) {
                var deferred = $q.defer();
                var apiName = 'questions';
                apiService.remove(apiName, id).then(function (data) {
                        deferred.resolve(data);
                    },
                    function (data) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            }

            function addNewQuestion() {
                var link = '/home/profiles/profiles/' + $state.current.resolve.profileType() + '/questionbank/new';
                $location.path('/home/profiles/profiles/' + $state.current.resolve.profileType() + '/questionbank/new');
            }

            function editQuestion(id) {
                $location.path('/home/profiles/profiles/' + $state.current.resolve.profileType() + '/questionbank/edit/' + id);
            }

            function goToEditPage(id) {
                if (($location.path().indexOf('newQuestion') > -1) || ($location.path().indexOf('editQuestion') > -1)) {
                    var path = $location.path();
                    path = path.replace("newQuestion", "editQuestion");
                    $location.path(path);
                } else {
                    $location.path('/home/profiles/profiles/' + $state.current.resolve.profileType() + '/questionbank/edit/' + id);
                }
            }

            function returnToPerviousPage() {
                $state.go(
                    $state.$current.parent.self.name,
                    null,
                    {reload: true}
                );
            }

            function getParentSkillsNames(skills) {
                var deferred = $q.defer();
                for (var i = 0, len = skills.length; i < len; i++) {
                    if (skills[i].parentId) {
                        var foundedParent = getById(skills[i].parentId, skills);
                        var currentName = skills[i].name;
                        skills[i].name = "Parent " + foundedParent.name + "/" + currentName;
                    }
                }

                skills = $filter('orderBy')(skills, 'name');
                deferred.resolve(skills);

                return deferred.promise;
            }

            function getById(id, myArray, searchParam) {
                (!searchParam) ? searchParam = 'id' : '';
                return myArray.filter(function (obj) {
                    if (obj[searchParam] == id) {
                        return obj
                    }
                })[0]
            }

            this.questionTypes = function () {
                return apiService.getAll('questions/types');
            };
        }]);