using IPS.BusinessModels.TaskModels;
using System;
using System.Collections.Generic;

namespace IPS.Business.Interfaces
{
    public interface ITaskCategoryListItemsService
    {
        IPS.Data.TaskCategoryListItem Add(IPS.Data.TaskCategoryListItem item);
        List<TaskCategoriesListItemModel> GetCategoriesListItemsByCategoriesListId(int categoriesListId);
        void Delete(IPS.Data.TaskCategoryListItem item);
        System.Linq.IQueryable<IPS.Data.TaskCategoryListItem> Get();
        System.Linq.IQueryable<IPS.Data.TaskCategoryListItem> GetTasksListById(int id);
        void Update(IPS.Data.TaskCategoryListItem item);
    }
}
