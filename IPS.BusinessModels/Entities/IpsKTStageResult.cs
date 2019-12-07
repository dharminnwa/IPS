using System.Collections.Generic;

namespace IPS.BusinessModels.Entities
{
    public class IpsKTStageResult
    {
        public int StageId { get; set; }
        public string StageName { get; set; }
        public int TimeSpent { get; set; }
        public int AllTime { get; set; }
        public int CorrectAnswersCount { get; set; }
        public int QuestionsCount { get; set; }
        public int Score { get; set; }
        public int PassScore { get; set; }
        public int MaxScore { get; set; }
        public IpsKtMedalRules MedalRule { get; set; }
    }
}
