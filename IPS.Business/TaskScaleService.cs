using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading.Tasks;

namespace IPS.Business
{

    public class TaskScaleService : BaseService, IPS.Business.ITaskScaleService
    {

        public IQueryable<TaskScale> Get()
        {
            return _ipsDataContext.TaskScales.AsNoTracking().AsQueryable();
        }
        public IQueryable<TaskScale> GetDetail(int organizationId, int? departmentId, int? teamId, int? userId)
        {
            IQueryable<TaskScale> result = null;

            if ((userId != null) && (_ipsDataContext.TaskScales.Where(tp => tp.UserId == userId).Count() > 0))
            {
                result = _ipsDataContext.TaskScales.Include("TaskScaleRanges").Where(tp => tp.OrganizationId == organizationId && tp.UserId == userId).AsNoTracking().AsQueryable();
            }
            else if ((teamId != null) && (_ipsDataContext.TaskStatusLists.Where(tp => tp.TeamId == teamId).Count() > 0))
            {
                result = _ipsDataContext.TaskScales.Include("TaskScaleRanges").Where(tp => tp.OrganizationId == organizationId && tp.TeamId == teamId).AsNoTracking().AsQueryable();
            }
            else if ((departmentId != null) && (_ipsDataContext.TaskStatusLists.Where(tp => tp.DepartmentId == departmentId).Count() > 0))
            {
                result = _ipsDataContext.TaskScales.Include("TaskScaleRanges").Where(tp => tp.OrganizationId == organizationId && tp.DepartmentId == departmentId).AsNoTracking().AsQueryable();
            }
            else if (_ipsDataContext.TaskStatusLists.Where(tp => tp.OrganizationId == organizationId).Count() > 0)
            {
                result = _ipsDataContext.TaskScales.Include("TaskScaleRanges").Where(tp => tp.OrganizationId == organizationId && tp.DepartmentId == null && tp.TeamId == null && tp.UserId == null).AsNoTracking().AsQueryable();
            }
            return result;
        }

        public IQueryable<TaskScale> GetTaskScaleRatings(int? userId)
        {
            IQueryable<TaskScale> result = null;

            if ((userId != null) && (_ipsDataContext.TaskScales.Where(tp => tp.UserId == userId).Count() > 0))
            {
                result = _ipsDataContext.TaskScales.Include("TaskScaleRanges").Where(tp => tp.UserId == userId).AsNoTracking().AsQueryable();
            }

            return result;
        }

        public IQueryable<TaskScale> GetById(int id)
        {
            return _ipsDataContext.TaskScales.Where(s => s.Id == id).AsQueryable();
        }

        public TaskScale Add(TaskScale taskScale)
        {

            _ipsDataContext.TaskScales.Add(taskScale);
            _ipsDataContext.SaveChanges();

            return taskScale;
        }

        public bool Update(TaskScale taskScale)
        {

            var original = _ipsDataContext.TaskScales.Include("TaskScaleRanges").Where(s => s.Id == taskScale.Id).SingleOrDefault();

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(taskScale);

                _ipsDataContext.TaskScaleRanges.RemoveRange(original.TaskScaleRanges);
                _ipsDataContext.TaskScaleRanges.AddRange(taskScale.TaskScaleRanges);
                /*_ipsDataContext.SaveChanges();
                foreach (TaskScaleRange scaleRange in taskScale.TaskScaleRanges)
                {
                    scaleRange.Id = -1;
                    _ipsDataContext.TaskScaleRanges.Add(scaleRange);
                }*/

                _ipsDataContext.SaveChanges();
            }




            return true;
        }

        public bool Delete(TaskScale taskScale)
        {
            List<TaskScaleRanx> scaleRanges = _ipsDataContext.TaskScaleRanges.Where(s => s.TaskScalesId == taskScale.Id).ToList();
            _ipsDataContext.TaskScaleRanges.RemoveRange(scaleRanges);
            _ipsDataContext.TaskScales.Remove(taskScale);
            _ipsDataContext.SaveChanges();

            return true;
        }
    }
}
