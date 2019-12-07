using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SalesActivityModels
{
   public class ProspectingGoalActivityInfoModel
    {
        public int Id { get; set; }
        public Nullable<int> ProfileId { get; set; }
        public string GoalName { get; set; }
        public int ProspectingGoalId { get; set; }
        public int ActivityTime { get; set; }
        public int BreakTime { get; set; }
        public int TotalActivities { get; set; }
        public System.DateTime ActivityStartTime { get; set; }
        public System.DateTime ActivityEndTime { get; set; }
        public Nullable<int> UserId { get; set; }
        public int ActivityCalculationType { get; set; }
        public string Frequency { get; set; }

        public virtual List<ProspectingActivity> ProspectingActivities { get; set; }
        public virtual ProspectingGoalInfo ProspectingGoalInfo { get; set; }
    }
}
