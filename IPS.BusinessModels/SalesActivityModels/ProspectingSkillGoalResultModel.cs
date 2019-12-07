using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SalesActivityModels
{
    public class ProspectingSkillGoalResultModel
    {
        public int ProspectingGoalId { get; set; }
        public int SkillId { get; set; }
        public string SkillName { get; set; }
        public int Goal { get; set; }
        public int Count { get; set; }
        public int Result { get; set; }
        public int? SeqNo { get; set; }
    }
}
