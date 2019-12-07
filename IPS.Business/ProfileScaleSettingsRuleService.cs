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
    public class ProfileScaleSettingsRuleService : BaseService, IPS.Business.IProfileScaleSettingsRuleService
    {
        public IQueryable<ProfileScaleSettingsRule> Get()
        {
            return _ipsDataContext.ProfileScaleSettingsRules.AsNoTracking().AsQueryable();
        }

        public ProfileScaleSettingsRule GetById(int id)
        {
            return _ipsDataContext.ProfileScaleSettingsRules.Where(psr => psr.Id == id).FirstOrDefault();
        }


        public ProfileScaleSettingsRule Add(ProfileScaleSettingsRule profileScaleSettingsRule)
        {
            _ipsDataContext.ProfileScaleSettingsRules.Add(profileScaleSettingsRule);
            _ipsDataContext.SaveChanges();
            return profileScaleSettingsRule;
        }

        public bool Update(ProfileScaleSettingsRule profileScaleSettingsRule)
        {

            var original = _ipsDataContext.ProfileScaleSettingsRules.Find(profileScaleSettingsRule.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(profileScaleSettingsRule);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(ProfileScaleSettingsRule profileScaleSettingsRule)
        {
            _ipsDataContext.ProfileScaleSettingsRules.Remove(profileScaleSettingsRule);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }

    }
}
