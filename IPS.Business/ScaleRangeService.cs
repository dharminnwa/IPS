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
    
    public class ScaleRangeService : BaseService, IPS.Business.IScaleRangeService
    {
        public IQueryable<ScaleRange> Get()
        {
            return _ipsDataContext.ScaleRanges.AsNoTracking().AsQueryable();
        }

        public ScaleRange GetById(int id)
        {
           return _ipsDataContext.ScaleRanges.Where(sr => sr.Id == id).FirstOrDefault();
        }

        public ScaleRange Add(ScaleRange scaleRanges)
        {
            _ipsDataContext.ScaleRanges.Add(scaleRanges);
            _ipsDataContext.SaveChanges();
            return scaleRanges;
        }

        public bool Update(ScaleRange scaleRanges)
        {

            var original = _ipsDataContext.ScaleRanges.Find(scaleRanges.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(scaleRanges);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(ScaleRange scaleRanges)
        {
            _ipsDataContext.ScaleRanges.Remove(scaleRanges);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }
    }
}
