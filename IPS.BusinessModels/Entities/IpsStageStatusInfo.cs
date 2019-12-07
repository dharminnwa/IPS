using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsStageStatusInfo
    {
        public int StageId { get; set; }
        public bool IsLocked { get; set; }
        public bool IsInUse { get; set; }

        public IpsStageStatusInfo() { }
    }
}
