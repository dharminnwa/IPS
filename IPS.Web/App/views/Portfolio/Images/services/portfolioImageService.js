angular.module('ips.portfolio')
.service('portfolioImageService', portfolioImageService)
portfolioImageService.$inject(['$q','apiService']);
portfolioImageService=function($q,$api)
{
    return {
        getAllImages:function()
        {
            $q.when(getAllImages());
        },
        getImagesById:function(id){
            $q.when(getImagesById(id));
        },
        addImages:function(imageData)
        {
            $q.when(addImages(imageData));
        },
        updateImages:function(imageData)
        {
            $q.when(updateImages(imageData));
        }
    }
}
function getAllImages()
{
    var deffered=$q.defer();
    $api.getAll('/Upload/UploadPortfolioImages','').then(function(data){
        deffered.resolve(data);
    })
    return deffered.promise;
}
function getImagesById(id)
{
    var deffered=$q.defer();
    $api.getById()
}