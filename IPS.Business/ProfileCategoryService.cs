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
    
    public class ProfileCategoryService : BaseService, IPS.Business.IProfileCategoryService
    {
        public IQueryable<ProfileCategory> Get()
        {
            return _ipsDataContext.ProfileCategories.AsNoTracking().AsQueryable();
        }

        public ProfileCategory GetById(int id)
        {
            return _ipsDataContext.ProfileCategories.Where(pc => pc.Id == id).FirstOrDefault();
        }

        public ProfileCategory Add(ProfileCategory profileCategory)
        {
            _ipsDataContext.ProfileCategories.Add(profileCategory);
            _ipsDataContext.SaveChanges();
            return profileCategory;
        }

        public bool Update(ProfileCategory profileCategory)
        {

            var original = _ipsDataContext.ProfileCategories.Find(profileCategory.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(profileCategory);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(ProfileCategory profileCategory)
        {
            _ipsDataContext.ProfileCategories.Remove(profileCategory);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }
    }
}
