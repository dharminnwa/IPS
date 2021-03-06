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
    
    public partial class MilestoneAgreementGoal
    {
        public int Id { get; set; }
        public int StageId { get; set; }
        public int ParticipantId { get; set; }
        public Nullable<decimal> Goal { get; set; }
        public int EvaluationAgreementId { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
    
        public virtual EvaluationAgreement EvaluationAgreement { get; set; }
        public virtual EvaluationParticipant EvaluationParticipant { get; set; }
        public virtual Stage Stage { get; set; }
    }
}
