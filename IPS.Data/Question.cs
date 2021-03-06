//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace IPS.Data
{
    using System;
    using System.Collections.Generic;
    
    public partial class Question
    {
        public Question()
        {
            this.Answers = new HashSet<Answer>();
            this.Skills = new HashSet<Skill>();
            this.Link_PerformanceGroupSkills = new HashSet<Link_PerformanceGroupSkills>();
            this.EvaluationAgreements = new HashSet<EvaluationAgreement>();
            this.StagesEvolutionQuestions = new HashSet<StagesEvolutionQuestion>();
            this.SurveyAnswers = new HashSet<SurveyAnswer>();
        }
    
        public int Id { get; set; }
        public string QuestionText { get; set; }
        public string Description { get; set; }
        public int AnswerTypeId { get; set; }
        public bool IsActive { get; set; }
        public bool IsTemplate { get; set; }
        public Nullable<int> OrganizationId { get; set; }
        public Nullable<int> ProfileTypeId { get; set; }
        public Nullable<int> ScaleId { get; set; }
        public string QuestionSettings { get; set; }
        public Nullable<int> StructureLevelId { get; set; }
        public Nullable<int> IndustryId { get; set; }
        public Nullable<int> SeqNo { get; set; }
        public Nullable<int> Points { get; set; }
        public Nullable<int> TimeForQuestion { get; set; }
        public Nullable<int> ParentQuestionId { get; set; }
    
        public virtual ICollection<Answer> Answers { get; set; }
        public virtual AnswerType AnswerType { get; set; }
        public virtual Industry Industry { get; set; }
        public virtual ProfileType ProfileType { get; set; }
        public virtual Scale Scale { get; set; }
        public virtual StructureLevel StructureLevel { get; set; }
        public virtual ICollection<Skill> Skills { get; set; }
        public virtual Organization Organization { get; set; }
        public virtual ICollection<Link_PerformanceGroupSkills> Link_PerformanceGroupSkills { get; set; }
        public virtual ICollection<EvaluationAgreement> EvaluationAgreements { get; set; }
        public virtual PossibleAnswer PossibleAnswer { get; set; }
        public virtual ICollection<StagesEvolutionQuestion> StagesEvolutionQuestions { get; set; }
        public virtual QuestionMaterial QuestionMaterial { get; set; }
        public virtual ICollection<SurveyAnswer> SurveyAnswers { get; set; }
    }
}
