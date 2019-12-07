using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SalesActivityModels
{
    public class ProspectingCustomerModel
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

        public DateTime? MeetingScheduleDate { get; set; }
        public string MeetingAgenda { get; set; }
        public bool IsOfferSent { get; set; }
        public decimal OfferPrice { get; set; }
        public DateTime? OfferFollowUpScheduleDate { get; set; }
     


        public bool IsOfferClosed { get; set; }
        public int? ClosedOfferStatus { get; set; }
        public DateTime? ClosingDate { get; set; }
        public int? Possibility { get; set; }
    }
}
