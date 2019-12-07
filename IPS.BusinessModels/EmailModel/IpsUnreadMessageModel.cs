using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.EmailModel
{
    public class IpsUnreadMessageModel
    {
        public IpsUnreadMessageModel()
        {
            Messages = new List<IpsEmailModel>();
        }
        public int Count { get; set; }
        public List<IpsEmailModel> Messages { get; set; }
    }
}
