using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SkillModels
{
    public class IpsSkillModel
    {
        public int? Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

    }
    public class IpsProfileSkillModel
    {
        public int? Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public int? ProfileId { get; set; }
        public string ProfileName { get; set; }

        public int? PerformanceGroupId { get; set; }
        public string PerformanceGroupName { get; set; }

        public int? SeqNo { get; set; }

        public Nullable<decimal> Benchmark { get; set; }
        public string Weight { get; set; }
        public string CSF { get; set; }
        public string Action { get; set; }

    }
}
