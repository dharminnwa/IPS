using IPS.BusinessModels.Common;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class JobPositionService : BaseService, IPS.Business.IJobPositionService
    {
        public IQueryable<JobPosition> Get()
        {
            return _ipsDataContext.JobPositions.AsQueryable();
        }

        public JobPosition GetById(int id)
        {
            return _ipsDataContext.JobPositions.Where(jp => jp.Id == id).FirstOrDefault();
        }

        public List<IPSDropDown> GetDDL()
        {
            return _ipsDataContext.JobPositions.Select(x => new IPSDropDown
            {
                Id = x.Id,
                Name = x.JobPosition1,
            }).OrderBy(x => x.Name).ToList();
        }

        public JobPosition Add(JobPosition jobPosition)
        {
            _ipsDataContext.JobPositions.Add(jobPosition);
            _ipsDataContext.SaveChanges();
            return jobPosition;
        }

        public bool Update(JobPosition jobPosition)
        {

            var original = _ipsDataContext.JobPositions.Find(jobPosition.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(jobPosition);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(JobPosition jobPosition)
        {
            _ipsDataContext.JobPositions.Remove(jobPosition);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }

    }
}
