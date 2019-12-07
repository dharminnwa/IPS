using IPS.Data;
using System;
using System.Linq;
namespace IPS.Business
{
    public interface IProfileScaleSettingsRuleService
    {
        ProfileScaleSettingsRule Add(ProfileScaleSettingsRule profileScaleSettingsRule);
        bool Delete(ProfileScaleSettingsRule profileScaleSettingsRule);
        IQueryable<ProfileScaleSettingsRule> Get();
        IPS.Data.ProfileScaleSettingsRule GetById(int id);
        bool Update(ProfileScaleSettingsRule profileScaleSettingsRule);

        
    }
}
