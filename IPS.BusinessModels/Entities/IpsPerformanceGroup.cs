using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsPerformanceGroup
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Nullable<int> OrganizationId { get; set; }
        public Nullable<int> ProfileId { get; set; }
        public string ProfileName { get; set; }
    }
}
