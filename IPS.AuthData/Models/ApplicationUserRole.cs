using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models
{
    public class ApplicationUserRole : IdentityUserRole
    {
        public int OrganizationId { get; set; }
    }
}
