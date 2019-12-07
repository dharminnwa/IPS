using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;

namespace IPS.Business
{
    public interface ITrainingDescriptionService
    {
        TrainingDescription Add(TrainingDescription trainingDescription);
        bool Delete(TrainingDescription trainingDescription);
        IQueryable<TrainingDescription> Get();
        List<TrainingDescription> GetTrainingDescriptionsBySkillId(int skillId);
        IQueryable<TrainingDescription> GetById(int id);
        bool Update(TrainingDescription trainingDescription);
    }
}
