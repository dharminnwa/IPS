using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SalesActivityModels
{
    public class ProspectingGoalResultSummaryModel
    {
        public ProspectingGoalResultSummaryModel()
        {
            TodayResult = new List<ProspectingGoalResultModel>();
            WeeklyResult = new List<ProspectingGoalResultModel>();
            MonthlyResult = new List<ProspectingGoalResultModel>();
            TotalResult = new List<ProspectingGoalResultModel>();
        }
        public int prospectingGoalId { get; set; }
        public string prospectingGoalName { get; set; }
        public int projectId { get; set; }
        public string projectName { get; set; }
        public int? userId { get; set; }
        public string userName { get; set; }
        public List<ProspectingGoalResultModel> TodayResult { get; set; }
        public List<ProspectingGoalResultModel> WeeklyResult { get; set; }
        public List<ProspectingGoalResultModel> MonthlyResult { get; set; }
        public List<ProspectingGoalResultModel> TotalResult { get; set; }
    }
}
