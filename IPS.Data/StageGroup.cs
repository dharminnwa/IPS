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
    
    public partial class StageGroup
    {
        public StageGroup()
        {
            this.EvaluationParticipants = new HashSet<EvaluationParticipant>();
            this.UserRecurrentNotificationSettings = new HashSet<UserRecurrentNotificationSetting>();
            this.Profiles = new HashSet<Profile>();
            this.Stages = new HashSet<Stage>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Nullable<System.DateTime> StartDate { get; set; }
        public Nullable<System.DateTime> EndDate { get; set; }
        public Nullable<int> ParentStageGroupId { get; set; }
        public Nullable<int> ParentParticipantId { get; set; }
        public int MonthsSpan { get; set; }
        public int WeeksSpan { get; set; }
        public int DaysSpan { get; set; }
        public int HoursSpan { get; set; }
        public int MinutesSpan { get; set; }
        public Nullable<long> ActualTimeSpan { get; set; }
        public int TotalMilestones { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> StartStageStartDate { get; set; }
        public Nullable<System.DateTime> StartStageEndDate { get; set; }
        public Nullable<System.DateTime> MilestoneStartDate { get; set; }
        public Nullable<System.DateTime> MilestoneEndDate { get; set; }
    
        public virtual ICollection<EvaluationParticipant> EvaluationParticipants { get; set; }
        public virtual ICollection<UserRecurrentNotificationSetting> UserRecurrentNotificationSettings { get; set; }
        public virtual ICollection<Profile> Profiles { get; set; }
        public virtual ICollection<Stage> Stages { get; set; }
    }
}