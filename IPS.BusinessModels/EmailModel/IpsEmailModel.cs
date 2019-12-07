using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.EmailModel
{
    public class IpsEmailModel
    {
        public IpsEmailModel()
        {
            this.IPSEMailAttachments = new List<IPSEMailAttachment>();
        }

        public int Id { get; set; }
        public string Subject { get; set; }
        public string Message { get; set; }
        public string ToAddress { get; set; }
        public string CCAddress { get; set; }
        public System.DateTime SentTime { get; set; }
        public string FromAddress { get; set; }
        public Nullable<int> FromUserId { get; set; }
        public Nullable<int> ToUserId { get; set; }
        public string BCCAddress { get; set; }
        public bool HasAttachment { get; set; }
        public bool IsUserEmail { get; set; }
        public bool IsSentEmail { get; set; }
        public bool IsReceivedEmail { get; set; }
        public bool IsRead { get; set; }
        public string GmailId { get; set; } 
        public List<IPSEMailAttachment> IPSEMailAttachments { get; set; }
    }
}
