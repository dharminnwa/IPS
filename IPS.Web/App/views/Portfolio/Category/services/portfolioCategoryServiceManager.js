
    angular.module('ips.portfolio.service',[])
        .service("portfolioCategoryManager",['$q','apiService',function($q,$service){
            function getAllcategory()
            {
                var deffered =$q.defer();
                $service.getAll('/PortfolioCategory/GetPortfolioCategory/','').then(function(data){
                    deffered.resolve(data);
                })
                return deffered.promise;
            }
            function getCategory(id)
            {
                var deffered=$q.defer();
                $service.getById('/PortfolioCategory/GetPortfolioCategoryByID',id).then(function(data){
                    deffered.resolve(data)
                })
                return deffered.promise;
            }
            function addCategory(categoryData)
            {
                var deffered=$q.defer();
                $service.add('/portfolio/AddPortfolioCategory',categoryData).then(function(data){
                    deffered.resolve(data);
                })
                return deffered.promise;

            }
            function updateCategory(updateData)
            {
                var deffered=$q.defer();
                $service.update('portfolio/UpdatePortfolioCategory',updateData).then(function(data){
                    deffered.resolve(data);
                })
                return deffered.promise;
            }
            function getLanguages()
            {
                var deferred=$q.defer();
                $service.getAll('portfolio/getlanguages','').then(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            }

            return{
                getAllCategory:function(){
                    return $q.when(getAllcategory());
                },
                getCategory:function(id){
                    return  $q.when(getCategory(id));
                },
                addCategory:function(categoryData){
                    return $q.when(addCategory(categoryData));
                },
                updateCategory:function(updatedData){
                    return $q.when(updateCategory(updatedData));
                },
                getLanguages:function(){
                    return $q.when(getLanguages());
                }
            }

        }]);


