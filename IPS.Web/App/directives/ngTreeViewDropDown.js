app.directive('ngTreeViewDropDown', ['$compile', function ($compile) {
    return {
        restrict: 'EA',
        template: '<div ></div>',
        scope: {
            ngData: '=',
            ngModel: '=',
            ngSelect: '&ngSelect',
            ngDisabled: '='
        },
        replace: true,
        controller: ['$scope', 'apiService', '$compile', '$element', function ($scope, apiService, $compile, $element) {
            var dropDownTreeView = $element.kendoExtDropDownTreeView({
                        treeview: {
                            dataSource: $scope.ngData,
                            loadOnDemand: false
                        }
            }).data("kendoExtDropDownTreeView");

            dropDownTreeView.bind("select", function (e) {
                if ($scope.ngModel)
                {
                    $scope.ngModel = this._treeview.dataItem(e.node).id;
                }
                
                if ($scope.ngSelect)
                {
                    $scope.ngSelect({$event: this._treeview.dataItem(e.node)});
                }
            });
            
            var treeview = dropDownTreeView._treeview;
            var dropdown = dropDownTreeView._dropdown;

            if ($scope.ngDisabled === true) {
                dropdown.enable(false);
            }
            var $dropdownRootElem = $(dropdown.element).closest("span.k-dropdown");
            $dropdownRootElem.css("width", "100%");

            $(window).resize(function () {
                $treeviewRootElem.css("width", $dropdownRootElem.width());
            });

            var $treeviewRootElem = $(treeview.element).closest("div.k-treeview");
            $treeviewRootElem.css("width", $dropdownRootElem.width());
            $treeviewRootElem.css("height", "200px");
            
            treeview.expand(".k-item");

            var nodeDataItem = treeview.dataSource.get($scope.ngModel);
            if (nodeDataItem) {
                
                var selectedNode = treeview.findByUid(nodeDataItem.uid);
                treeview.select(selectedNode);


                dropdown.nodeDataItem = nodeDataItem;
                dropdown.text(nodeDataItem.text);
            } else {
                var root = treeview.findByText('root')
                treeview.select(root);

                dropdown.text('root');
            }
        }],
        link: function ($scope, element, attrs) {

            //$scope.$watch('ngModel', function (newValue, oldValue) {
            //    if (newValue) {
            //        $scope.init(newValue, element[0].id);
            //    }
            //}, false);

        }
    }
}]);