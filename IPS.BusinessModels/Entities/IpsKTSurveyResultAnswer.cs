using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsKTSurveyResultAnswer
    {
        public int ParticipantId { get; set; }
        public List<string> SkillNames { get; set; }
        public string PerformanceGroupName { get; set; }
        public string QuestionText { get; set; }
        public int Points { get; set; }
        public Nullable<decimal> Bemchmark { get; set; }
        public int? ScorePoint { get; set; }
        public bool IsCorrect { get; set; }
        public bool IsAvailable { get; set; }
    }
}
