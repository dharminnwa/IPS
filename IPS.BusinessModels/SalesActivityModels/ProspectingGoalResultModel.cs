using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SalesActivityModels
{
    public class ProspectingGoalResultModel
    {
        public ProspectingGoalResultModel()
        {
            ProspectingSkillGoalResults = new List<ProspectingSkillGoalResultModel>();
        }
        public int Id { get; set; }
        public int? ProfileId { get; set; }
        public string ProspectingName { get; set; }
        public string ProfileName { get; set; }
        public int? ParticipantId { get; set; }
        public string ParticipantName { get; set; }
        public int UserId { get; set; }
        public DateTime? GoalStartDate { get; set; }
        public DateTime? GoalEndDate { get; set; }
        public List<ProspectingSkillGoalResultModel> ProspectingSkillGoalResults { get; set; }
    }
}
