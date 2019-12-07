using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;
using IPS.BusinessModels.Common;

namespace IPS.Business
{
    public interface IDurationMetricsService
    {
        DurationMetric Add(DurationMetric durationMetric);
        bool Delete(DurationMetric durationMetric);
        IQueryable<DurationMetric> Get();
        IQueryable<DurationMetric> GetById(int id);
        bool Update(DurationMetric durationMetric);
        List<IPSDropDown> GetDDL();
    }
}
