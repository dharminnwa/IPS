(function () {
    _.isNullorUndefinedorEmpty = function (obj) {
        return _.isNull(obj) || _.isUndefined(obj) || _.isEmpty(obj);
    }

    _.isNotNullandUndefinedandEmpty = function (obj) {
        return !_.isNullorUndefinedorEmpty(obj);
    }
})();