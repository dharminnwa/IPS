using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SalesActivityModels
{
    public class ProspectingGoalInfoModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ProspectingType { get; set; }
        public Nullable<int> ProfileId { get; set; }
        public int StageId { get; set; }
        public string StageName { get; set; }

        public string ProfileName { get; set; }
        public Nullable<int> ParticipantId { get; set; }
        public Nullable<int> UserId { get; set; }
        public string UserName { get; set; }
        public Nullable<int> TaskId { get; set; }
        public string RecurrenceRule { get; set; }
        public Nullable<int> ProspectingGoalScaleId { get; set; }

        public Nullable<System.DateTime> GoalStartDate { get; set; }
        public Nullable<System.DateTime> GoalEndDate { get; set; }
        public Profile Profile { get; set; }

        public List<ProspectingSkillGoal> ProspectingSkillGoals { get; set; }
        public List<ProspectingGoalActivityInfo> ProspectingGoalActivityInfoes { get; set; }
        public ProspectingGoalScale ProspectingGoalScale { get; set; }
    }
}
