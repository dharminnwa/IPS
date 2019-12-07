using System.Collections.Generic;
using IPS.Data;

namespace IPS.BusinessModels.Entities
{
    public class IpsKTEvaluationAnswer
    {
        public int Id { get; set; }
        public string PerformanceGroupName { get; set; }
        public List<string> SkillNames { get; set; }
        public string QuestionText { get; set; }
        public QuestionMaterial QuestionMaterial { get; set; }
        public string Answer { get; set; }
        public string CorrectAnswer { get; set; }
        public string Comment { get; set; }
    }
}
