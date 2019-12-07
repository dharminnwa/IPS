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
    
    public partial class SurveyAnswer
    {
        public SurveyAnswer()
        {
            this.Trainings = new HashSet<Training>();
        }
    
        public int Id { get; set; }
        public int SurveyResultId { get; set; }
        public int QuestionId { get; set; }
        public Nullable<bool> IsCorrect { get; set; }
        public string Answer { get; set; }
        public string Comment { get; set; }
        public Nullable<bool> InDevContract { get; set; }
    
        public virtual Question Question { get; set; }
        public virtual SurveyResult SurveyResult { get; set; }
        public virtual ICollection<Training> Trainings { get; set; }
    }
}