using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SalesActivityModels
{
    public class UserSalesActivityResultDataModel
    {
        public UserSalesActivityResultDataModel()
        {
            ProspectingSkillGoalResults = new List<ProspectingSkillGoalResultModel>();
        }
        public int ProspectingGoalId { get; set; }
        public string ProspectingGoalName { get; set; }
        public Nullable<System.DateTime> GoalStartDate { get; set; }
        public Nullable<System.DateTime> GoalEndDate { get; set; }
        public string ActvitiyName { get; set; }
        public DateTime ActvitiyStart { get; set; }
        public DateTime ActvitiyEnd { get; set; }
        public Nullable<System.DateTime> UserStartTime { get; set; }
        public Nullable<System.DateTime> UserStopTime { get; set; }
        public List<ProspectingSkillGoalResultModel> ProspectingSkillGoalResults { get; set; }
        public String ActivityStatus { get; set; }
        public String ExpiredActivityReason { get; set; }
    }
}
