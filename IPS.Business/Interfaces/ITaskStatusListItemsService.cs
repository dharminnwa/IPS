using IPS.BusinessModels.TaskModels;
using System;
using System.Collections.Generic;

namespace IPS.Business.Interfaces
{
    public interface ITaskStatusListItemsService
    {
        IPS.Data.TaskStatusListItem Add(IPS.Data.TaskStatusListItem item);
        void Delete(IPS.Data.TaskStatusListItem item);
        System.Linq.IQueryable<IPS.Data.TaskStatusListItem> Get();
        System.Linq.IQueryable<IPS.Data.TaskStatusListItem> GetTasksListById(int id);
        void Update(IPS.Data.TaskStatusListItem item);

        List<TaskStatusListItemModel> GetStatusListItemsByStatusListId(int StatusListId);
    }
}
