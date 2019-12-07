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

    public class ScaleCategoryService : BaseService, IPS.Business.IScaleCategoryService
    {
        public IQueryable<ScaleCategory> Get()
        {
            return _ipsDataContext.ScaleCategories.AsNoTracking().AsQueryable();
        }

        public ScaleCategory GetById(int id)
        {
           return _ipsDataContext.ScaleCategories.Where(sc => sc.Id == id).FirstOrDefault();
        }

        public ScaleCategory Add(ScaleCategory scaleCategory)
        {
            _ipsDataContext.ScaleCategories.Add(scaleCategory);
            _ipsDataContext.SaveChanges();
            return scaleCategory;
        }

        public bool Update(ScaleCategory scaleCategory)
        {

            var original = _ipsDataContext.ScaleCategories.Find(scaleCategory.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(scaleCategory);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(ScaleCategory scaleCategory)
        {
            _ipsDataContext.ScaleCategories.Remove(scaleCategory);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }
    }
}
