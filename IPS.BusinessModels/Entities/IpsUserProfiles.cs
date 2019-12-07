using IPS.BusinessModels.UserModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsUserProfiles
    {
       
        public IpsUserProfile[] ActiveProfiles { get; set; }
        public IpsUserProfile[] CompletedProfiles { get; set; }
        public IpsUserProfile[] History { get; set; }

        public IpsUserProfiles(List<IpsUserProfile> activeProfiles, List<IpsUserProfile> completedProfiles, List<IpsUserProfile> history)
        {
            if (activeProfiles != null)
            {
                IpsUserProfile[] active = new IpsUserProfile[activeProfiles.Count];
                activeProfiles.CopyTo(active);
                ActiveProfiles = active;
            }
            if (completedProfiles != null)
            {
                IpsUserProfile[] completed = new IpsUserProfile[completedProfiles.Count];
                completedProfiles.CopyTo(completed);
                CompletedProfiles = completed;
            }
            if (history != null)
            {
                IpsUserProfile[] profiles = new IpsUserProfile[history.Count];
                history.CopyTo(profiles);
                History = profiles;
            }
            
        }

    }
}
