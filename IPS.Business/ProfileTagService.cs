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
    
    public class ProfileTagService : BaseService, IPS.Business.IProfileTagService
    {
        public List<Tag> Get()
        {
            return _ipsDataContext.Tags.ToList();
        }

        public Tag GetById(int id)
        {
            return _ipsDataContext.Tags.Where(pc => pc.Id == id).FirstOrDefault();
        }

        public Tag Add(Tag profileTag)
        {
            _ipsDataContext.Tags.Add(profileTag);
            _ipsDataContext.SaveChanges();
            return profileTag;
        }

        public bool Update(Tag profileTag)
        {

            var original = _ipsDataContext.ProfileCategories.Find(profileTag.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(profileTag);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(Tag profileTag)
        {
            _ipsDataContext.Tags.Remove(profileTag);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }
    }
}
