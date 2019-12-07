(function () {
    'use strict';

    angular
        .module('ips.finalKPI')

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            
        $stateProvider
            .state('home.KPI', {
                url: "/KPI/:profileId/:stageId/:participantId",
                templateUrl: "views/KPI/views/KPI.html",
                controller: "KPICtrl as kpi",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('COMMON_KPI');
                    },
                    scorecardData: function ($stateParams, surveyAnalysisService) {
                        return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.participantId);
                    },
                    answers: function (surveyAnalysisService, scorecardData, $stateParams) {
                        var query = '?$expand=Question&$filter=ParticipantId eq ' + $stateParams.participantId + ' and StageId eq ' + $stateParams.stageId;
                        return surveyAnalysisService.getAnswers(scorecardData, query, $stateParams.participantId, $stateParams.stageId).then(function (data) {
                            return data;
                        });
                    },
                    profile: function ($stateParams, profilesService) {
                        return profilesService.getById($stateParams.profileId);
                    },
                    answerTypes: function (profile, surveyService) {
                        return surveyService.generateAnswers(profile.scale.scaleRanges)
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'KPI',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])

    .controller('KPICtrl', KPICtrl);

    KPICtrl.$inject = ['cssInjector', 'answers', 'KPIService', '$filter', 'profile', 'answerTypes', 'surveyService', '$state', 'scorecardData', '$translate'];

    function KPICtrl(cssInjector, answers, KPIService, $filter, profile, answerTypes, surveyService, $state, scorecardData, $translate) {
        cssInjector.add('views/finalKPI/finalKPI.css');

        var vm = this;
        vm.participantUser = (scorecardData && scorecardData.length > 0) ? scorecardData[0].participantUser : {};
        vm.answerTypes = surveyService.getAnswers();

        vm.sortCondition = {
            column: '1',
            descending: false
        }
        vm.answers = answers;
        vm.profile = profile;
        
        vm.tableHead = KPIService.getTableHeaders();
        vm.totalWeakKPI = 0;
        vm.totalStrongKPI = 0;

        //fixAnswers();

        function fixAnswers() {
            for (var i = 0; i < vm.answers.length; i++) {
                vm.answers[i].answer1 = parseFloat(vm.answers[i].answer1);
            }
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

        function getAnswerColor(value) {
            var result = getById(value, vm.answerTypes, 'value');
            if (result) {
                return result.color;
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
                if (Number(predicate) === predicate && predicate % 1 === 0) {
                    predicate = valueParser;
                }
                vm.answers = orderBy(vm.answers, predicate, reverse);
            }
        }

        function valueParser(value) {
            return parseInt(value);
        }

        function increaseKPI(answer, fromLimit) {
            var kpiWeak = 1;
            var kpiStrong = 2;
            (!answer.kPIType) ? answer.kPIType = null : '';
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
                        (!fromLimit) ? vm.totalWeakKPI-- : '';
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

        function getById(id, myArray, searchParam) {
            (!searchParam) ? searchParam = 'id' : '';
            return myArray.filter(function (obj) {
                if (obj[searchParam] == parseInt(id, 10)) {
                    return obj
                }
            })[0]
        }

        function submitKPI() {
            KPIService.submitKPI(vm.answers).then(function (data) {
                notification($translate.instant('MYPROFILES_SURVEY_SUBMITED_SUCCESSFULLY'));
                $state.go(
                    $state.$current.parent.self.name,
                    null,
                    { reload: true }
                );
            },
            function (data) {
                notification($translate.instant('MYPROFILES_SURVEY_SUBMIT_FAILED'));
            })
        }

        function notification(message) {
            vm.notificationSavedSuccess.show(message, "info");
        }

        function isRequired() {
            return !(vm.totalWeakKPI == vm.profile.kpiWeak && vm.totalStrongKPI == vm.profile.kpiStrong);
        }

        /*function commentsFilled() {
            var res = true;
            angular.forEach(vm.answers, function (answer) {
                if (!answer.comment)
                {
                    res = false;
                    return;
                }
            });
            return res;
        }*/

        vm.addSortingClass = addSortingClass;
        vm.changeSorting = changeSorting;
        vm.isRequired = isRequired;
        vm.submitKPI = submitKPI;
        vm.getAnswerColor = getAnswerColor;
        vm.increaseKPI = increaseKPI;
        //vm.commentsFilled = commentsFilled;
    }

})();