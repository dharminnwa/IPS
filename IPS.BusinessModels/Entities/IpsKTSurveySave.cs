using System.Collections.Generic;

namespace IPS.BusinessModels.Entities
{
    public class IpsKTSurveySave
    {
        public int? StageId { get; set; }
        public int? StageEvolutionId { get; set; }
        public int ParticipantId { get; set; }
        public int TimeSpent { get; set; }
        public IEnumerable<UserAnswerInfo> QuestionAnswers { get; set; }
    }

    public class UserAnswerInfo
    {
        public int QuestionId { get; set; }
        public string UserAnswer { get; set; }
        public string Comment { get; set; }
    }
}