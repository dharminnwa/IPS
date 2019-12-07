using IPS.AuthData.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsUserPermission
    {
        public int OrganizationId { get; set; }
        public List<IpsUserRolePermission> RolePermissionsOwnResources { get; set; }
        public List<IpsUserRolePermission> RolePermissionsAllResources { get; set; }
    }
}
