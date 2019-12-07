using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models
{
    public class ApplicationRole : IdentityRole<string, ApplicationUserRole>
    {
        public ApplicationRole():base()
        {
            this.RolePermissions = new List<RolePermission>();
        }
        public int RoleLevel { get; set; }
        public int OrganizationId { get; set; }
        public virtual ICollection<RolePermission> RolePermissions { get; set; }
        public virtual ICollection<RoleOrganisationPermission> RoleOrganisationPermissions { get; set; }
        
    }
}
