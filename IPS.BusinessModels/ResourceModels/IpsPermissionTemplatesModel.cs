using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ResourceModels
{
    public class IpsPermissionTemplatesModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<IpsPermissionTemplateResourcesModel> ResourcePermissions { get; set; }
    }
}
