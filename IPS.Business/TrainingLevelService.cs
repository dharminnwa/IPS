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

    public class TrainingLevelService : BaseService, IPS.Business.ITrainingLevelService
    {
        public IQueryable<TrainingLevel> Get()
        {
           return _ipsDataContext.TrainingLevels.AsNoTracking().AsQueryable();
        }
        public List<IPSDropDown> GetDDL()
        {
            return _ipsDataContext.TrainingLevels.Select(x=>new IPSDropDown {
                Id = x.Id,
                Name = x.Name,
            }).OrderBy(x=>x.Name).ToList();
        }
        public IQueryable<TrainingLevel> GetById(int id)
        {
            return _ipsDataContext.TrainingLevels.Where(tl => tl.Id == id).AsQueryable();

        }

        public TrainingLevel Add(TrainingLevel trainingLevel)
        {
            _ipsDataContext.TrainingLevels.Add(trainingLevel);
           _ipsDataContext.SaveChanges();
           return trainingLevel;

        }

        public bool Update(TrainingLevel trainingLevel)
        {

            var original = _ipsDataContext.TrainingLevels.Find(trainingLevel.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(trainingLevel);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(TrainingLevel trainingLevel)
        {
            _ipsDataContext.TrainingLevels.Remove(trainingLevel);
            _ipsDataContext.SaveChangesAsync();
            return true;
        }
    }
}
