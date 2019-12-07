using IPS.AuthData.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsUserRole
    {
        public string UserId;
        public int OrganizationId;
        public string RoleId;
        public int RoleLevelId { get; set; }
    }
}

