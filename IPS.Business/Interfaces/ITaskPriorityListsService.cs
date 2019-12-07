using System;
using System.Collections.Generic;

namespace IPS.Business.Interfaces
{
    public interface ITaskPriorityListsService
    {
        IPS.Data.TaskPriorityList Add(IPS.Data.TaskPriorityList item);
        void Delete(IPS.Data.TaskPriorityList item);
        System.Linq.IQueryable<IPS.Data.TaskPriorityList> Get();
        System.Linq.IQueryable<IPS.Data.TaskPriorityList> Get(int organizationId, int? departmentId, int? teamId, int? userId);
        System.Linq.IQueryable<IPS.Data.TaskPriorityList> GetTasksListById(int id);
        void Update(IPS.Data.TaskPriorityList item);
        int CreateFromDefaultTemplate(int organizationId, int? departmentId, int? teamId, int? userId);
        System.Linq.IQueryable<IPS.Data.TaskPriorityList> GetUserlist(int userId);
    }
}
