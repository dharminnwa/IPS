using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ResourceModels
{
    public class IpsRoleLevelAdvancePermission
    {
        public int Id { get; set; }
        public int RoleLevelId { get; set; }
        public int PermissionLevelId { get; set; }
    }
}
