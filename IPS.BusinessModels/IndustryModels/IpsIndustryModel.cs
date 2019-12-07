using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.IndustryModels
{
    public class IpsIndustryModel
    {
        public IpsIndustryModel() {
            SubIndustries = new List<IpsSubIndustryModel>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Nullable<int> ParentId { get; set; }
        public List<IpsSubIndustryModel> SubIndustries { get; set; }
        public Nullable<int> OrganizationId { get; set; }
    }
}
