using IPS.Data;
using IPS.BusinessModels.Entities;
using System;
using System.Linq;
using System.Collections.Generic;
namespace IPS.Business
{
    public interface ITaskStatusService
    {
        IQueryable<TaskStatusListItem> GetTaskStatusListByUserId(int Id);
       /* IQueryable<TaskStatusListItem> GetTasksListById(int taskId);
        TaskStatusListItem Add(TaskStatusListItem task);
        void Delete(TaskStatusListItem task);
        void Update(TaskStatusListItem task);*/
    }
}
