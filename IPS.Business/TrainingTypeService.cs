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

    public class TrainingTypeService : BaseService, IPS.Business.ITrainingTypeService
    {
        public IQueryable<TrainingType> Get()
        {
           return _ipsDataContext.TrainingTypes.AsNoTracking().AsQueryable();
        }
        public List<IPSDropDown> GetDDL()
        {
            return _ipsDataContext.TrainingTypes.Select(x=>new IPSDropDown {
                Id = x.Id,
                Name = x.Name
            }).OrderBy(x=>x.Name).ToList();
        }

        public IQueryable<TrainingType> GetById(int id)
        {
            return _ipsDataContext.TrainingTypes.Where(tt => tt.Id == id).AsQueryable();
        }

        public TrainingType Add(TrainingType trainingType)
        {
           _ipsDataContext.TrainingTypes.Add(trainingType);
           _ipsDataContext.SaveChanges();
           return trainingType;

        }

        public bool Update(TrainingType trainingType)
        {

            var original = _ipsDataContext.TrainingTypes.Find(trainingType.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(trainingType);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(TrainingType trainingType)
        {
            _ipsDataContext.TrainingTypes.Remove(trainingType);
            _ipsDataContext.SaveChangesAsync();
            return true;
        }
    }
}
