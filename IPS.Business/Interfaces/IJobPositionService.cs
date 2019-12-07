using IPS.BusinessModels.Common;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
namespace IPS.Business
{
    public interface IJobPositionService
    {
        JobPosition Add(JobPosition profile);
        bool Delete(JobPosition profile);
        IQueryable<JobPosition> Get();
        JobPosition GetById(int id);
        bool Update(JobPosition profile);
        List<IPSDropDown> GetDDL();
    }
}
