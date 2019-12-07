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
    
    public class TrainingDescriptionService : BaseService, IPS.Business.ITrainingDescriptionService
    {
        public IQueryable<TrainingDescription> Get()
        {
           return _ipsDataContext.TrainingDescriptions.AsNoTracking().AsQueryable();
        }

        public IQueryable<TrainingDescription> GetById(int id)
        {
            return _ipsDataContext.TrainingDescriptions.Where(td => td.Id == id).AsQueryable();

        }
       public List<TrainingDescription> GetTrainingDescriptionsBySkillId(int skillId) {
            return _ipsDataContext.TrainingDescriptions.Where(td => td.SkillId == skillId).ToList();
        }
        public TrainingDescription Add(TrainingDescription trainingDescription)
        {
            _ipsDataContext.TrainingDescriptions.Add(trainingDescription);
           _ipsDataContext.SaveChanges();
           return trainingDescription;

        }

        public bool Update(TrainingDescription trainingDescription)
        {

            var original = _ipsDataContext.TrainingDescriptions.Find(trainingDescription.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(trainingDescription);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(TrainingDescription trainingDescription)
        {
            _ipsDataContext.TrainingDescriptions.Remove(trainingDescription);
            _ipsDataContext.SaveChangesAsync();
            return true;
        }
    }
}
