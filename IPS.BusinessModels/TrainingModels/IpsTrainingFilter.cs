using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingModels
{
    public class IpsTrainingFilter
    {
        public IpsTrainingFilter()
        {
            SubIndustryIds = new List<int>();
        }
        public int OrganizationId { get; set; }
        public int PerformanceGroupId { get; set; }
        public int TrainingLevelId { get; set; }
        public int TrainingTypeId { get; set; }
        public bool IsShowActive { get; set; }
        public bool IsShowInactive { get; set; }
        public bool IsTemplate { get; set; }
        public int SkillId { get; set; }
        public int ProfileLevelId { get; set; }
        public int JobPositionId { get; set; }
        public int IndustryId { get; set; }
        public List<int> SubIndustryIds { get; set; }
    }
}
