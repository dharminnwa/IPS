'use strict';

angular.module('ips.organization.security', ['ui.router', 'kendo.directives', 'growing-panes'])

.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home.security.editUserRoles', {
            url: "/editUserRoles/:organizationId",
            templateUrl: "views/security/editUserRoles/editUserRoles.html",
            controller: "EditUserRolesCtrl",
            resolve: {
                pageName: function ($translate) {
                    return $translate.instant('SECURITY_USER_ROLES_EDIT');
                }
            },
            data: {
                displayName: '{{pageName}}',//'User Roles Edit',
                paneLimit: 2,
                depth: 3
            }
        });
}])

.controller('EditUserRolesCtrl', ['$scope', '$location', 'authService', 'apiService', '$window', '$rootScope', 'cssInjector', '$compile', '$stateParams', function ($scope, $location, authService, apiService, $window, $rootScope, cssInjector, $compile, $stateParams) {
    //cssInjector.removeAll();
    //cssInjector.add('views/security/security.css');
    
    $scope.organizationId = $stateParams.organizationId;
}])