using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsKTAnalysisAnswer
    {
        public int UserAnswerId { get; set; }
        public int QuestionId { get; set; }
        public string PerformanceGroupName { get; set; }
        public List<string> SkillNames { get; set; }
        public string QuestionText { get; set; }
        public string UserAnswer { get; set; }
        public string PossibleAnswers { get; set; }
        public string CorrectAnswer { get; set; }
        public string Comment { get; set; }
        public int AnswerTypeId { get; set; }
        public bool IsCorrectAnswer { get; set; }
    }
}
