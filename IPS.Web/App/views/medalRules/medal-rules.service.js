'use strict';

angular.module('ips.medalRules')
    .service('medalRulesService', ['apiService', '$translate', function (apiService, $translate) {
        var baseUrl = 'ktmedalrule';

        this.checkInUse = function (id) {
            return apiService.getById(baseUrl + "/checkinuse", id);
        };

        this.getAll = function () {
            return apiService.getAll(baseUrl);
        };

        this.getById = function (id) {
            if (id > 0) {
                return apiService.getById(baseUrl, id).then(function (data) {
                    data.viewName = data.name;
                    return data;
                });
            }
            else {
                return {
                    id: 0,
                    name: "",
                    viewName: $translate.instant('SOFTPROFILE_NEW_MEDAL_RULE')
                };
            }
        };

        this.remove = function (id) {
            return apiService.remove(baseUrl, id);
        };

        this.clone = function (id) {
            return apiService.add(baseUrl + "/" + id + "/clone", null);
        };

        this.update = function (item) {
            return apiService.update(baseUrl, item);
        };

        this.add = function (item) {
            return apiService.add(baseUrl, item);
        };
    }]);
