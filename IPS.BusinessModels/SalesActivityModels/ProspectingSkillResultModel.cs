using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SalesActivityModels
{
    public class ProspectingSkillResultModel
    {
        public int Id { get; set; }
        public int ProspectingCustomerId { get; set; }
        public int ProspectingActivityId { get; set; }
        public Nullable<int> SkillId { get; set; }
        public bool IsDone { get; set; }
        public string Description { get; set; }
        public Nullable<int> Duration { get; set; }
        public bool IsNoMeeting { get; set; }
        public bool IsMeeting { get; set; }
        public bool IsFollowUp { get; set; }
        public Nullable<int> CustomerInterestRate { get; set; }
        public string Reason { get; set; }
        public DateTime? ScheduleTime { get; set; }
        //public virtual ProspectingActivity ProspectingActivity { get; set; }
        //public virtual Skill Skill { get; set; }
        //public virtual ICollection<ProspectingSchedule> ProspectingSchedules { get; set; }
        public virtual ProspectingCustomer ProspectingCustomer { get; set; }
    }
}
