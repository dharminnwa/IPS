using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;

namespace IPS.BusinessModels.Entities
{
    public class IpsAddress
    {
        public IpsAddress() {
            Address = new List<string>();
        }
        public List<string> Address { get; set; }
        public string From { get; set; }
    }
}
