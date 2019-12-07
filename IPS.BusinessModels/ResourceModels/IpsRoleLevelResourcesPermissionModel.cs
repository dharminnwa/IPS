using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ResourceModels
{
    public class IpsRoleLevelResourcesPermissionModel
    {
        public int Id { get; set; }
        public int ResourceId { get; set; }
       
        public int OperationId { get; set; }
      
        public int RoleLevelId { get; set; }
    }
}
