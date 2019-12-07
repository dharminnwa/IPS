using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsSurveyInfo
    {
        public bool AreKPISet { get; set; }
        public bool IsFirstStage { get; set; }
        public bool IsFinalStage { get; set; }
        public bool IsSelfEvaluated { get; set; }
        public bool IsOpen { get; set; }
        public List<Answer> SurveyAnswers { get; set; }
        public List<Answer> PreviousSurveyAnswers { get; set; }
        public List<EvaluationAgreement> Agreements { get; set; }
        public List<Stage> Stages { get; set; }
        public int StageNo { get; set; }
        public int EvaluateeId { get; set; }
        public string EvaluateeFullName { get; set; }
    }
}
