using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ResourceModels
{
   public class IpsRoleLevelPermissionModel
    {
        public IpsRoleLevelPermissionModel()
        {
            IpsRoleLevelResourcesPermissionModels = new List<IpsRoleLevelResourcesPermissionModel>();
        }
        public int RoleLevelId { get; set; }
        public List<IpsRoleLevelResourcesPermissionModel> IpsRoleLevelResourcesPermissionModels { get; set; }
    }
}
