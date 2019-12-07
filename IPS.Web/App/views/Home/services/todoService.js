(function () {
    'use strict';

    angular
        .module('ips')
        .service('todoService', ['todoManager', function (todoManager) {

    var todos = [];

    this.todos = todos;
    this.load = function () {
        return todoManager.getTodosById();
    }
}])

})();