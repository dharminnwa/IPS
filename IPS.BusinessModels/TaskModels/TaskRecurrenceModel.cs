using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TaskModels
{
    public class TaskRecurrenceModel
    {
        public Nullable<System.DateTime> RecurrencesStartTime { get; set; }
        public Nullable<System.DateTime> RecurrencesEndTime { get; set; }
        public bool IsRecurrences { get; set; }
        public string RecurrencesRule { get; set; }
        public int TaskId { get; set; }
    }
}
