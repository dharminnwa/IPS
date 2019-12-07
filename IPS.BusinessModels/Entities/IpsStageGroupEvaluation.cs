using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsStageGroupEvaluation
    {
        public int StageId { get; set; }
        public bool IsKPISet { get; set; }
        public bool IsRCTAdded { get; set; }
        public int StageGroupId { get; set; }
    }
}
