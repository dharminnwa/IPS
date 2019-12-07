using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.EmailModel
{
    public class IpsGmailUserModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string MessageId { get; set; }
        public bool IsSentMail { get; set; }
    }
}
