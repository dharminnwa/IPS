using IPS.BusinessModels.UserModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.CustomerModels
{
    public class CustomerHistoryModel
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; }
        public int ProspectingActivityId { get; set; }
        public int ProspectingCustomerId { get; set; }
        public int ProspectingGoalId { get; set; }
        public string ProspectingGoalName { get; set; }
        public string ActivityName { get; set; }
        public string CustomerDescription { get; set; }
        public DateTime? ActivityDate { get; set; }
        public int? ActivityBy { get; set; }
        public IpsUserModel ActivityByUser { get; set; }
        public int SeqNo { get; set; }
        public int ResultType { get; set; }
        public string SchduledFor { get; set; }
        public DateTime? ScheduleDate { get; set; }
        public string ResultDescription { get; set; }

    }
}
