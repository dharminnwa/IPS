using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ResourceModels
{
    public class IpsResourceDependencyModel
    {
        public IpsResourceDependencyModel()
        {
            DependentResources = new List<IpsResourceDependencyModel>();
        }
        public int Id { get; set; }
        public int ResourceId { get; set; }
        public string ResourceName { get; set; }
        public int DependentResourceId { get; set; }
        public int OperationId { get; set; }
        public List<IpsResourceDependencyModel> DependentResources { get; set; }
    }
}
