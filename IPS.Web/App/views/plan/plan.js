angular.module('ips.plan', [])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.plan.plan', {
                url: "/list",
                templateUrl: "views/plan/plan.html",
                controller: "planCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('COMMON_CATEGORY');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Category',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('home.plan.add', {
                url: "/add",
                templateUrl: "views/plan/planAdd.html",
                controller: "planCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('COMMON_ADD');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'ADD',
                    paneLimit: 1,
                    depth: 3
                }
            })
            .state('home.plan.edit', {
                url: "/:planId",
                templateUrl: "views/plan/planAdd.html",
                controller: "planCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('COMMON_EDIT');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'EDIT',
                    paneLimit: 1,
                    depth: 3
                }
            });

    }])
    .service("planManager", ['apiService', '$http', function ($api, $q, $http) {

        this.getPlans = function ($apiName, $query) {
            return $api.getAll($apiName, $query).then(function (response) {
                return response;
            })
        }
        this.getById = function ($apiName, $id) {
            return $api.getById($apiName, $id).then(function (response) {
                return response;
            })
        }
        this.update = function ($apiName, $data) {
            return $api.update($apiName, $data).then(function (data) {

            })

        }

    }])
    .controller("planCtrl", ['$scope', 'cssInjector', '$stateParams', '$rootScope', 'planManager', 'languageService', function ($scope, $cssInjector, $stateParams, $rootScope, $plan, $language) {
        $cssInjector.removeAll();
        $cssInjector.add("views/plan/plan.css");
        $scope.allPlans = null;
        $scope.planId = parseInt(($stateParams.planId) ? $stateParams.planId : null);
        $scope.planData = null;
        $scope.updatePlan = updatePlan;
        $scope.getAllPlans = getAllPlans();
        $scope.getPlanById = getPlanById;
        $scope.transferEdit = transferEdit;
        $scope.getLanguages = getLanguages;


        function getAllPlans() {
            $plan.getPlans("plan/getallplan").then(function (data) {
                verifyResponse(data) ? $scope.allPlans = data : '';
            })
        }
        function getPlanById() {
            if ($scope.planId) {
                $plan.getById('plan/GetPlanById', $scope.planId).then(function (data) {
                    verifyResponse(data) ? $scope.planData = data : '';

                })
            }
        }
        function updatePlan() {

            if ($scope.planId && typeof ($scope.planId) == 'number') {
                $plan.update('plan/update', $scope.planData).then(function (data) {
                    verifyResponse(data)
                })
            }
        }
        function verifyResponse($res, $flag) {
            $status = ($res) ? { status: 'true', message: $flag + ' Successfully', type: 'success' } : { status: 'false', mesage: 'Not ' + $flag, type: 'danger' };
            return $status.status;
        }
        function transferEdit($value) {
            location.href = '#home/plan/' + $value;
        }
        function getLanguages() {
            $language.getAllLanguage().then(function (data) {
                console.log(data);
                $scope.languages = data;
            })
        }

    }])