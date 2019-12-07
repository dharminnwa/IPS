using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TaskModels
{
    public class IPSTaskModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string RecurrenceRule { get; set; }
        public Nullable<System.DateTime> DueDate { get; set; }
        public Nullable<System.DateTime> StartDate { get; set; }
        public Nullable<int> StatusId { get; set; }

        public List<IPSTaskActivityModel> TaskActivities { get; set; }
    }
}
