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
    
    public class ProfileTypeService : BaseService, IPS.Business.IProfileTypeService
    {
        public IQueryable<ProfileType> Get()
        {
            return _ipsDataContext.ProfileTypes.AsQueryable();
        }

        public ProfileType GetById(int id)
        {
            return _ipsDataContext.ProfileTypes.Where(pt => pt.Id == id).FirstOrDefault();
        }

        public ProfileType Add(ProfileType profileType)
        {
            _ipsDataContext.ProfileTypes.Add(profileType);
            _ipsDataContext.SaveChanges();
            return profileType;
        }

        public bool Update(ProfileType profileType)
        {

            var original = _ipsDataContext.ProfileTypes.Find(profileType.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(profileType);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(ProfileType profileType)
        {
            _ipsDataContext.ProfileTypes.Remove(profileType);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }

        public int GetProfileTypeByProfileId(int profileId)
        {
            int profileType = _ipsDataContext.Profiles
                .Where(p => p.Id == profileId)
                .Select(p => p.ProfileTypeId)
                .FirstOrDefault();
            return profileType;
        }
    }
}
