using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsScorecardPeriod
    {
        public DateTime PeriodDate { get; set; }
        public string PeriodTitle { get; set; }
        public int StageId { get; set; }

        public IpsScorecardPeriod(DateTime periodDate, string periodTitle, int stageId)
        {
            PeriodDate = periodDate;
            PeriodTitle = periodTitle;
            StageId = stageId;
        }
    }
}
