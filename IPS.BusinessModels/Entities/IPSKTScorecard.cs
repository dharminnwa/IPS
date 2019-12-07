using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IPSKTScorecard
    {
        public int? PassScore { get; set; }
        public IpsKtMedalRules MedalRule { get; set; }
        public List<SkillResult> SkillResults { get; set; }
    }

    public class SkillResult
    {
        public int SkillId { get; set; }
        public string SkillName { get; set; }
        public int PgId { get; set; }
        public string PgName { get; set; }
        public int PerspectiveId { get; set; }
        public int PointsScore { get; set; }
        public double PercentScore { get; set; }
        public int CorrectAnswersCountScore { get; set; }
        public int AllQuestionsPoints { get; set; }
        public decimal? Benchmark { get; set; }
        public string Weight { get; set; }
        public string CSF { get; set; }
        public string Action { get; set; }
        public int QuestionId { get; set; }
        public string QuestionText { get; set; }
        public string AnswerValue { get; set; }
    }
}
