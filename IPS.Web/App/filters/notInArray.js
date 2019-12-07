app.filter('notInArray', function ($filter) {
    return function(list, arrayFilter,element){
        if(arrayFilter){
            if (element){
                return $filter("filter")(list, function(listItem){
                    return arrayFilter.indexOf(listItem[element]) == -1;
                });
            } else{
                return $filter("filter")(list, function(listItem){
                    return arrayFilter.indexOf(listItem) == -1;
                });
            }
        }
    }
});