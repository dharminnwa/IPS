using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class MeasureUnitService : BaseService, IPS.Business.IMeasureUnitService
    {
        public IQueryable<MeasureUnit> Get()
        {
            return _ipsDataContext.MeasureUnits.AsNoTracking().AsQueryable();
        }

        public MeasureUnit GetById(int id)
        {
            return _ipsDataContext.MeasureUnits.Where(mu => mu.Id == id).FirstOrDefault();
        }

        public MeasureUnit Add(MeasureUnit measureUnit)
        {
            _ipsDataContext.MeasureUnits.Add(measureUnit);
            _ipsDataContext.SaveChanges();
            return measureUnit;
        }

        public bool Update(MeasureUnit measureUnit)
        {

            var original = _ipsDataContext.MeasureUnits.Find(measureUnit.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(measureUnit);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(MeasureUnit measureUnit)
        {
            _ipsDataContext.MeasureUnits.Remove(measureUnit);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }

    }
}
