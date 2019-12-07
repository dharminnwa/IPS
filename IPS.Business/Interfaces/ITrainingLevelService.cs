using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;
using IPS.BusinessModels.Common;

namespace IPS.Business
{
    public interface ITrainingLevelService
    {
        TrainingLevel Add(TrainingLevel trainingLevel);
        bool Delete(TrainingLevel trainingLevel);
        IQueryable<TrainingLevel> Get();
        IQueryable<TrainingLevel> GetById(int id);
        bool Update(TrainingLevel trainingLevel);
        List<IPSDropDown> GetDDL();
    }
}
