using System;
using System.Collections.Generic;

namespace IPS.AuthData.Models
{
    public partial class UserOrganization
    {
        public string UserId { get; set; }
        public int OrganizationId { get; set; }
        public virtual ApplicationUser ApplicationUser { get; set; }
    }
}
