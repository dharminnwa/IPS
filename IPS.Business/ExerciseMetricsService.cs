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
    
    public class ExerciseMetricsService : BaseService, IPS.Business.IExerciseMetricsService
    {
        public IQueryable<ExerciseMetric> Get()
        {
           return _ipsDataContext.ExerciseMetrics.AsNoTracking().AsQueryable();
        }

        public List<IPSDropDown> GetDDL()
        {
            return _ipsDataContext.ExerciseMetrics.Select(x => new IPSDropDown
            {
                Id = x.Id,
                Name = x.Name,
            }).OrderBy(x => x.Name).ToList();
        }
        public IQueryable<ExerciseMetric> GetById(int id)
        {
            return _ipsDataContext.ExerciseMetrics.Where(d => d.Id == id).AsQueryable();
        }

        public ExerciseMetric Add(ExerciseMetric exerciseMetric)
        {
            _ipsDataContext.ExerciseMetrics.Add(exerciseMetric);
            _ipsDataContext.SaveChanges();
            return exerciseMetric;
        }

        public bool Update(ExerciseMetric exerciseMetric)
        {

            var original = _ipsDataContext.ExerciseMetrics.Find(exerciseMetric.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(exerciseMetric);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(ExerciseMetric exerciseMetric)
        {
            _ipsDataContext.ExerciseMetrics.Remove(exerciseMetric);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }
    }
}
