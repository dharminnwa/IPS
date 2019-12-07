using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ResourceModels
{
    public class IpsPermissionModel
    {
        public int RoleLevelId { get; set; }
        public string RoleId { get; set; }
        public int PermissionLevelId { get; set; }
        public int OrganizationId { get; set; }
        public List<IpsRoleLevelResourcesPermissionModel> IpsRoleLevelResourcesPermissionModels { get; set; }

    }
}
