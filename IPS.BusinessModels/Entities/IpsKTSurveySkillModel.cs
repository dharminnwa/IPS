using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
   public class IpsKTSurveySkillModel
    {
        public int PerformanceGroupId { get; set; }
        public string PerformanceGroupName { get; set; }
        public int SkillId { get; set; }
        public string SkillName { get; set; }
    }
}
