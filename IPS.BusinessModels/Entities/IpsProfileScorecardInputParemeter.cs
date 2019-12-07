using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsProfileScorecardInputParemeter
    {

        public int OrganizationId { get; set; }
        public DateTime Date { get; set; }
        public int? UserId { get; set; }
    }
}
