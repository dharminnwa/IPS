(function () {
    'use strict';

    var serviceId = 'apiService';
    angular.module('ips').factory(serviceId, ['$http', '$q', 'ngProgressFactory', apiService]);

    function apiService($http, $q, ngProgressFactory) {
        var progress = ngProgressFactory.createInstance();
        progress.setColor("#FF7F00");
        var loader = $("#loaderWindow");
        loader.hide();
        var errHelper = {
            parseError: function (err) {
                //loader.show();
                progress.start();
                var errorMessage;
                if (err.data && err.data.message) {
                    errorMessage = err.data.message;

                    var errors = [];
                    for (var key in err.data.modelState) {
                        for (var i = 0; i < err.data.modelState[key].length; i++) {
                            if (errors.indexOf(err.data.modelState[key][i]) < 0) {
                                errors.push(err.data.modelState[key][i]);
                            }
                        }
                    }

                    errorMessage = errorMessage + " " + errors.join(' ');
                } else {
                    errorMessage = err;
                }
                //loader.hide();
                progress.complete();
                return errorMessage;
            }
        };

        var apiBaseUrl = webConfig.serviceBase + 'api/';

        var self = {
            getAll: function (apiName, query) {
                //loader.show();
                progress.start();
                var deferred = $q.defer();
                (!query) ? query = '' : '';
                $http.get(apiBaseUrl + apiName + query).then(function (result) {
                    deferred.resolve(result.data);
                    //loader.hide();
                    progress.complete();
                },
                    function (err, status) {
                        deferred.reject(errHelper.parseError(err));
                        //loader.hide();
                        progress.complete();
                    });
                return deferred.promise;

            },

            getById: function (apiName, id, options) {
                //loader.show();
                progress.start();
                var deferred = $q.defer();
                (!options) ? options = '' : '';
                $http.get(apiBaseUrl + apiName + "/" + id + "?" + options).then(function (result) {
                    deferred.resolve(result.data);
                    //loader.hide();
                    progress.complete();
                },
                    function (err, status) {
                        deferred.reject(errHelper.parseError(err));
                        //loader.hide();
                        progress.complete();
                    });

                return deferred.promise;
            },

            add: function (apiName, newEntity) {
                //loader.show();
                progress.start();
                var deferred = $q.defer();
                $http.post(apiBaseUrl + apiName, newEntity)
                    .then(function (result) {
                        deferred.resolve(result.data);
                        //loader.hide();
                        progress.complete();
                    },
                        function (err, status) {
                            deferred.reject(errHelper.parseError(err));
                            //loader.hide();
                            progress.complete();
                        });
                return deferred.promise;
            },

            update: function (apiName, updatedObject) {
                //loader.show();
                progress.start();
                var deferred = $q.defer();
                $http.put(apiBaseUrl + apiName, updatedObject)
                    .then(function (result) {
                        deferred.resolve(result.data);
                        //loader.hide();
                        progress.complete();
                    },
                        function (err, status) {
                            deferred.reject(errHelper.parseError(err));
                            //loader.hide();
                            progress.complete();
                        });
                return deferred.promise;
            },

            remove: function (apiName, id) {
                //loader.show();
                progress.start();
                var deferred = $q.defer();
                $http.delete(apiBaseUrl + apiName + "/" + id)
                    .then(function (result) {
                        deferred.resolve(result.data);
                        //loader.hide();
                        progress.complete();
                    },
                        function (err, status) {
                            deferred.reject(errHelper.parseError(err));
                            //loader.hide();
                            progress.complete();
                        });
                return deferred.promise;
            },

            ajax: function (apiName, method, params, callBacks) {
                //loader.show();
                progress.start();

                return $http({
                    url: apiBaseUrl + apiName,
                    method: method,
                    params: params
                }).then(function (result) {
                    //loader.hide();
                    progress.complete();

                    if (callBacks && callBacks.success) {
                        callBacks.success(result);
                    }
                },
                        function (err, status) {
                            //loader.hide();
                            progress.complete();

                            if (callBacks && callBacks.error) {
                                callBacks.error(err);
                            }
                        });
            },
            testapi: function (apiName, id) {
                progress.start();
                var deferred = $q.defer();
                $http.get(apiName + "/" + id).then(function (result) {
                    deferred.resolve(result.data);
                    //loader.hide();
                    progress.complete();
                },
                    function (err, status) {
                        deferred.reject(errHelper.parseError(err));
                        //loader.hide();
                        progress.complete();
                    });

                return deferred.promise;
            }
        };

        var api = {
            getAll: function (apiName, query) {
                return $q.when(self.getAll(apiName, query));
            },
            getById: function (apiName, id, options) {
                return $q.when(self.getById(apiName, id, options));
            },
            add: function (apiName, newEntity) {
                return $q.when(self.add(apiName, newEntity));
            },
            update: function (apiName, entityInfo) {
                return $q.when(self.update(apiName, entityInfo));
            },
            remove: function (apiName, id) {
                return $q.when(self.remove(apiName, id));
            },
            ajax: function (apiName, method, params, callBacks) {
                return self.ajax(apiName, method, params, callBacks);
            },
            testapi: function (apiName, id) {
                return $q.when(self.testapi(apiName, id));
            }
        };

        return api;
    }
})();