using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TaskModels
{
    public class IPSTaskActivityModel
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public Nullable<System.DateTime> RecurrenceStartTime { get; set; }
        public Nullable<System.DateTime> RecurrenceEndTime { get; set; }
        public string RecurrencesRule { get; set; }
        public Nullable<System.DateTime> ActivityDateTime { get; set; }
    }
}
