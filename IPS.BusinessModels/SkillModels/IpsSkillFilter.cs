using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SkillModels
{
    public class IpsSkillFilter
    {
        public bool IsActive { get; set; }
        public int? OrganizationId { get; set; }
        public int[] Industries { get; set; }
        public int? StructureLevelId { get; set; }
        public int? PerformanceGroupId { get; set; }
        public int? ProfileTypeId { get; set; }
        public int? ProfileLevelId { get; set; }
        public int? ProfileCategoryId { get; set; }
        public int[] JobPositions { get; set; }
        public int[] Tags { get; set; }
    }
}
