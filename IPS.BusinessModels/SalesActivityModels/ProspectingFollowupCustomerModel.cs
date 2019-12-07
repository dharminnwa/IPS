using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SalesActivityModels
{
    public class ProspectingFollowupCustomerModel
    {

        public int Id { get; set; }
        public int? CustomerId { get; set; }
        public int? ProspectingGoalId { get; set; }
        public int? ProspectingGoalUserId { get; set; }
        public int? ActivityId { get; set; }
        public string GoalName { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Detail { get; set; }
        public System.DateTime ScheduleDate { get; set; }
        public CustomerSalesData CustomerSalesData { get; set; }
        public int? CustomerSaleDataId { get; set; }
        public int AssignedToUserId { get; set; }
        public int AssignedByUserId { get; set; }
        public DateTime? AssignedOn { get; set; }

        public DateTime? FollowUpScheduleDate { get; set; }
        public string FollowUpReason { get; set; }

    }
}
