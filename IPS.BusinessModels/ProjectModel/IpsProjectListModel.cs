using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProjectModel
{
    public class IpsProjectListModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Summary { get; set; }
        public string VisionStatement { get; set; }
        public bool IsActive { get; set; }
        public System.DateTime ExpectedStartDate { get; set; }
        public System.DateTime ExpectedEndDate { get; set; }
        public string MissionStatement { get; set; }
        public List<string> GoalStatement { get; set; }
        public List<string> StratagiesStatement { get; set; }
        public int? OrganizationId { get; set; }
    }
}
