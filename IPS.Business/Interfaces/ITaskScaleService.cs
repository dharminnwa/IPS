using System;
using IPS.Data;
using System.Linq;
namespace IPS.Business
{
    public interface ITaskScaleService
    {
        IQueryable<TaskScale> Get();
        TaskScale Add(TaskScale taskScale);
        bool Delete(TaskScale taskScale);
        IQueryable<TaskScale> GetDetail(int organizationId, int? departmentId, int? teamId, int? userId);
        IQueryable<TaskScale> GetTaskScaleRatings(int? userId);
        IQueryable<TaskScale> GetById(int id);
        bool Update(TaskScale taskScale);
    }
}
