using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SalesActivityModels
{
    public class UserCusotmerModel
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Mobile { get; set; }
        public string PostCode { get; set; }
        public string CSVFileName { get; set; }
        public Nullable<int> AssignedUserId { get; set; }
        public int CustomerSaleDataId { get; set; }
        public string Model { get; set; }
        public string Type { get; set; }
        public string RegistrationNo { get; set; }
        public string Seller { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? UploadDate { get; set; }

        public Nullable<int> Offer { get; set; }
        public bool IsFollowUp { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public int? TaskId { get; set; }

        public bool IsCalled { get; set; }
        public bool IsTalked { get; set; }
        public bool IsMeeting { get; set; }
        public bool IsNotInterested { get; set; }
        public bool IsOfferSent { get; set; }
        public bool IsOfferClosed { get; set; }

    }
}
