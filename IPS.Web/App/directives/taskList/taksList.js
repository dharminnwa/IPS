(function () {
    'use strict';

    angular
        .module('ips')
        .directive('taskList', taskList);

    function taskList() {
        var directive = {
            restrict: 'EA',
            replace: true,
            templateUrl: 'directives/taskList/taskList.html',
            scope: {
            },
            controller: taskListController,
            controllerAs: 'task'
        };

        return directive;
    }

    taskListController.$inject = ['todoService', 'todoManager'];

    function taskListController(todoService, todoManager) {
        var vm = this;

        vm.orderProp = 'dueDate';
        vm.todos = todoService.todos;
        vm.isToday = isToday;

        function isToday(item) {
            var dueDate = moment(kendo.parseDate(item.dueDate));
            return (moment().diff(dueDate, 'days') == 0);
        }

        function completed(item) {
            item.isCompleted = !item.isCompleted;
            todoManager.isCompleted(item.id, item.isCompleted);
        }

        vm.completed = completed;
    }
})();