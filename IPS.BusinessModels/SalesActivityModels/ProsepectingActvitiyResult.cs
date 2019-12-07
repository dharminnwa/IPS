using IPS.BusinessModels.SkillModels;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SalesActivityModels
{
    public class ProsepectingActivityResultModel
    {
        public ProsepectingActivityResultModel() {
            Skills = new List<IpsSkillDDL>();
            ProspectingCustomerResults = new List<ProspectingCustomerResult>();
        }
        public int ActivityId { get; set; }
        public string ActivityName { get; set; }
        public System.DateTime ActivityStart { get; set; }
        public System.DateTime ActivityEnd { get; set; }
        public ProspectingCustomer ProspectingCustomer { get; set; }
        public List<IpsSkillDDL> Skills { get; set; }
        public List<ProspectingCustomerResult> ProspectingCustomerResults { get; set; }
    }
}
