using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;
using IPS.BusinessModels.Common;

namespace IPS.Business
{
    public interface IExerciseMetricsService
    {
        ExerciseMetric Add(ExerciseMetric exerciseMetric);
        bool Delete(ExerciseMetric exerciseMetric);
        IQueryable<ExerciseMetric> Get();
        IQueryable<ExerciseMetric> GetById(int id);
        bool Update(ExerciseMetric exerciseMetric);
        List<IPSDropDown> GetDDL();
    }
}
