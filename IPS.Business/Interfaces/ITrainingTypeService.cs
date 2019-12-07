using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;
using IPS.BusinessModels.Common;

namespace IPS.Business
{
    public interface ITrainingTypeService
    {
        TrainingType Add(TrainingType trainingType);
        bool Delete(TrainingType trainingType);
        IQueryable<TrainingType> Get();
        IQueryable<TrainingType> GetById(int id);
        bool Update(TrainingType trainingType);
        List<IPSDropDown> GetDDL();
    }
}
