using System.Collections.Generic;


namespace IPS.BusinessModels.Entities
{
    public class IpsKTSurveyInfo
    {
        public string ProfileName { get; set; }
        public int ProfileId { get; set; }
        public int QuestionsDisplayRuleId { get; set; }
        public bool RandomizeQuestions { get; set; }
        public bool AllowRevisitAnsweredQuestions { get; set; }
        public Dictionary<int, string> PerformanceGroupNames { get; set; }
        public List<IpsKTSurveyQuestions> Questions { get; set; }
    }
}
