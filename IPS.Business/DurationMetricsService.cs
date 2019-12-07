using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading.Tasks;
using IPS.BusinessModels.Common;

namespace IPS.Business
{
    
    public class DurationMetricsService : BaseService, IPS.Business.IDurationMetricsService
    {
        public IQueryable<DurationMetric> Get()
        {
           return _ipsDataContext.DurationMetrics.AsNoTracking().AsQueryable();
        }
        public List<IPSDropDown> GetDDL()
        {
            return _ipsDataContext.DurationMetrics.Select(x => new IPSDropDown
            {
                Id = x.Id,
                Name = x.Name,
            }).OrderBy(x=>x.Name).ToList();
        }
        public IQueryable<DurationMetric> GetById(int id)
        {
            return _ipsDataContext.DurationMetrics.Where(d => d.Id == id).AsQueryable();
        }

        public DurationMetric Add(DurationMetric durationMetric)
        {
            _ipsDataContext.DurationMetrics.Add(durationMetric);
            _ipsDataContext.SaveChanges();
            return durationMetric;
        }

        public bool Update(DurationMetric durationMetric)
        {

            var original = _ipsDataContext.DurationMetrics.Find(durationMetric.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(durationMetric);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(DurationMetric durationMetric)
        {
            _ipsDataContext.DurationMetrics.Remove(durationMetric);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }
    }
}
