using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingModels
{
   public class IPSTrainingNote
    {
        public int Id { get; set; }
        public int TrainingId { get; set; }
        public string Goal { get; set; }
        public string MeasureInfo { get; set; }
        public string ProceedInfo { get; set; }
        public string OtherInfo { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }

    }
}
