using IPS.Data;
using System;
using System.Collections.Generic;

namespace IPS.BusinessModels.Entities
{
    public class IpsKTFinalKPIItem
    {
        public IEnumerable<string> SkillNames { get; set; }
        public bool SelectForNextStage { get; set; }
        public string PerformanceGroupName { get; set; }
        public int QuestionId { get; set; }
        public string QuestionText { get; set; }
        public QuestionMaterial QuestionMaterial { get; set; }
        public int Points { get; set; }
        public bool IsCorrect { get; set; }
        public bool IsAvailable { get; set; }
        public string Comment { get; set; }
        public int AnswerId { get; set; }
        public string Answer { get; set; }
        public string PossibleAnswers { get; set; }
        public int AnswerTypeId { get; set; }
        public bool InDevContract { get; set; }
        public IpsKTSkill Skill { get; set; }
        public IEnumerable<Skill> Skills { get; set; }
        public IpsKTFinalKPIAgreement Agreement { get; set; }
        public IEnumerable<Training> Trainings { get; set; }
    }

    public class IpsKTFinalKPIAgreement
    {
        public IEnumerable<Training> Trainings { get; set; }
        public IpsKTFinalKPIStage Stage { get; set; }
    }

    public class IpsKTFinalKPIStage
    {
        public int Id { get; set; }
        public System.DateTime StartDateTime { get; set; }
        public System.DateTime EndDateTime { get; set; }
        public Nullable<System.DateTime> EvaluationStartDate { get; set; }
        public Nullable<System.DateTime> EvaluationEndDate { get; set; }
    }

    public class IpsKTFinalKPIResult
    {
        public List<IpsKTFinalKPIItem> Questions { get; set; }
        public bool HasDevContract { get; set; }
    }

    public class IpsKTSkill
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
