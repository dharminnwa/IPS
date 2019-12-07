'use strict';
app.factory('authInterceptorService', ['$q', '$injector', '$location', 'localStorageService', '$rootScope', 'globalVariables', function ($q, $injector, $location, localStorageService, $rootScope, globalVariables) {

    var authInterceptorServiceFactory = {};

    var _request = function (config) {

        config.headers = config.headers || {};

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            config.headers.Authorization = 'Bearer ' + authData.token;
            if (authData.user) {
                config.headers["OrganizationId"] = authData.user.organizationId;
            }
        }

        config.headers['Culture'] = globalVariables.lang.currentUICulture;

        return config;
    }

    function showError(error) {
        App.stopPageLoading();
        var html =
            '<div id="errorBox"> ' +
            ' <div style="text-align: center; width:100%"> ' +
            '   <div style="margin:10px 0 15px 0">' + error + '</div> ' +
            '   <button class="btn btn-cstm primary" id="errorOKButton" style="width: 50px">OK</button> ' +
            '   </div> ' +
            '</div> ';
        if ($("html #errorBox").length > 0) {
            $.each($("html #errorBox"), function (i, item) {
                $(item).kendoWindow('destroy');
                $(item).remove();
            });

        }
        $('body').append(html);

        var dialog = $('#errorBox').kendoWindow({
            width: "300px",
            modal: true,
            close: function () {
                this.destroy();
                if (!(window.history.length > 2)) {
                    var loginURL = window.location.origin + "/app/#/login";
                    window.location.replace(loginURL);
                    //window.location.href = loginURL;
                }
                else {

                    var authService = $injector.get('authService');
                    var authData = localStorageService.get('authorizationData');
                    if (authData == null) {
                        var loginURL = window.location.origin + "/app/#/login";
                        window.location.replace(loginURL);
                    }
                    else {
                        window.history.back();
                    }
                }

            }
        }).data("kendoWindow");

        $('#errorOKButton').click(function (e) {
            dialog.close();
        });

        dialog.center().open();

        $(".k-window-titlebar").height(30);
        $(".k-window-titlebar").css('background-color', '#ff6e19');
        $(".k-window-title").prepend("<img src='../Content/images/error.png' height='30' width='30' style='margin-top: -5px' />");

    }

    var _responseError = function (rejection) {
        if (rejection.status === 401) {
            var authService = $injector.get('authService');
            var authData = localStorageService.get('authorizationData');

            /*if (authData) {
                if (authData.useRefreshTokens) {
                    $location.path('/refresh');
                    return $q.reject(rejection);
                }
            }*/

            //$rootScope.returnToState = $location.url();

            //authService.logOut();
            //$location.path('/login');

            showError(rejection.data.message);
        }

        return $q.reject(rejection);
    }

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}]);