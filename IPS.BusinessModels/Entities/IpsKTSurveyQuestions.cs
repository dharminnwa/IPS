using System;

namespace IPS.BusinessModels.Entities
{
    public class IpsKTSurveyQuestions
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; }
        public int AnswerTypeId { get; set; }
        public string PossibleAnswer { get; set; }
        public string SkillName { get; set; }
        public int PerformanceGroupId { get; set; }
        public int TimeForQuestion { get; set; }
        public int SeqNo { get; set; }
        public IpsKTSurveyQuestionMaterial Material { get; set; }
    }

    public class IpsKTSurveyQuestionMaterial
    {
        public Guid? DocumentId { get; set; }
        public int MaterialType { get; set; }
        public string Link { get; set; }
        public string DocumentName { get; set; }
    }

}
