using System;
using System.Collections.Generic;

namespace IPS.Business.Interfaces
{
    public interface ITaskStatusListsService
    {
        IPS.Data.TaskStatusList Add(IPS.Data.TaskStatusList item);
        void Delete(IPS.Data.TaskStatusList item);
        System.Linq.IQueryable<IPS.Data.TaskStatusList> Get();
        System.Linq.IQueryable<IPS.Data.TaskStatusList> Get(int organizationId, int? departmentId, int? teamId, int? userId);
        System.Linq.IQueryable<IPS.Data.TaskStatusList> GetTasksListById(int id);
        
        void Update(IPS.Data.TaskStatusList item);
        int CreateFromDefaultTemplate(int organizationId, int? departmentId, int? teamId, int? userId);
        System.Linq.IQueryable<IPS.Data.TaskStatusList> GetUserlist(int userId);
    }
}
