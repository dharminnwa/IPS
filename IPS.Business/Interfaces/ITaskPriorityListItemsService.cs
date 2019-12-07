using IPS.BusinessModels.TaskModels;
using System;
using System.Collections.Generic;

namespace IPS.Business.Interfaces
{
    public interface ITaskPriorityListItemsService
    {
        IPS.Data.TaskPriorityListItem Add(IPS.Data.TaskPriorityListItem item);
        void Delete(IPS.Data.TaskPriorityListItem item);
        System.Linq.IQueryable<IPS.Data.TaskPriorityListItem> Get();
        System.Linq.IQueryable<IPS.Data.TaskPriorityListItem> GetTasksListById(int id);
        void Update(IPS.Data.TaskPriorityListItem item);
        List<TaskPriorityListItemModel> GetTaskPriorityListItemsByPriorityListId(int priorityListId);
    }
}
