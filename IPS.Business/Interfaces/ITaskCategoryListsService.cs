using System;
namespace IPS.Business.Interfaces
{
    public interface ITaskCategoryListsService
    {
        IPS.Data.TaskCategoryList Add(IPS.Data.TaskCategoryList item);
        void Delete(IPS.Data.TaskCategoryList item);
        System.Linq.IQueryable<IPS.Data.TaskCategoryList> Get();
        System.Linq.IQueryable<IPS.Data.TaskCategoryList> Get(int organizationId, int? departmentId, int? teamId, int? userId);
        System.Linq.IQueryable<IPS.Data.TaskCategoryList> GetTasksListById(int id);
        int CreateFromDefaultTemplate(int organizationId, int? departmentId, int? teamId, int? userId);
        void Update(IPS.Data.TaskCategoryList item);
        System.Linq.IQueryable<IPS.Data.TaskCategoryList> GetUserlist(int userId);
    }
}
