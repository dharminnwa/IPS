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
    
    public partial class PerformanceGroup
    {
        public PerformanceGroup()
        {
            this.PerformanceGroups1 = new HashSet<PerformanceGroup>();
            this.ScorecardGoals = new HashSet<ScorecardGoal>();
            this.ProfileTypes = new HashSet<ProfileType>();
            this.JobPositions = new HashSet<JobPosition>();
            this.Link_PerformanceGroupSkills = new HashSet<Link_PerformanceGroupSkills>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Nullable<int> OrganizationId { get; set; }
        public bool IsTemplate { get; set; }
        public Nullable<int> ParentId { get; set; }
        public Nullable<int> LevelId { get; set; }
        public Nullable<int> IndustryId { get; set; }
        public Nullable<int> ScorecardPerspectiveId { get; set; }
        public bool IsActive { get; set; }
        public Nullable<int> SeqNo { get; set; }
        public Nullable<int> ScaleId { get; set; }
        public Nullable<int> ProfileId { get; set; }
        public string TrainingComments { get; set; }
    
        public virtual Industry Industry { get; set; }
        public virtual ICollection<PerformanceGroup> PerformanceGroups1 { get; set; }
        public virtual PerformanceGroup PerformanceGroup1 { get; set; }
        public virtual Scale Scale { get; set; }
        public virtual ScorecardPerspective ScorecardPerspective { get; set; }
        public virtual StructureLevel StructureLevel { get; set; }
        public virtual ICollection<ScorecardGoal> ScorecardGoals { get; set; }
        public virtual ICollection<ProfileType> ProfileTypes { get; set; }
        public virtual ICollection<JobPosition> JobPositions { get; set; }
        public virtual Profile Profile { get; set; }
        public virtual Organization Organization { get; set; }
        public virtual ICollection<Link_PerformanceGroupSkills> Link_PerformanceGroupSkills { get; set; }
    }
}
