using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsStageGroupParticipant
    {
        public int UserId { get; set; }
        public int EvaluationRoleId { get; set; }
        public bool IsLocked { get; set; }
    }
}
