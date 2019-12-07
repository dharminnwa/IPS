using System.Collections.Generic;

namespace IPS.BusinessModels.Entities
{
    public class IpsKTFinalKPI
    {
        public int? StageId { get; set; }
        public int ParticipantId { get; set; }
        public int? StageEvolutionId { get; set; }
        public IEnumerable<int> NextStageQuestionsId { get; set; }
        public IEnumerable<IpsSurveyAnswerAgreement> SurveyAnswerAgreements { get; set; }
    }
}