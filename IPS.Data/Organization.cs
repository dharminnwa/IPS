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
    
    public partial class Organization
    {
        public Organization()
        {
            this.Departments = new HashSet<Department>();
            this.Organizations1 = new HashSet<Organization>();
            this.ScorecardGoals = new HashSet<ScorecardGoal>();
            this.ScorecardPerspectives = new HashSet<ScorecardPerspective>();
            this.PerformanceGroups = new HashSet<PerformanceGroup>();
            this.ProfileCategories = new HashSet<ProfileCategory>();
            this.Profiles = new HashSet<Profile>();
            this.ProfileTypes = new HashSet<ProfileType>();
            this.Questions = new HashSet<Question>();
            this.Skills = new HashSet<Skill>();
            this.TaskCategoryLists = new HashSet<TaskCategoryList>();
            this.TaskPriorityLists = new HashSet<TaskPriorityList>();
            this.TaskStatusLists = new HashSet<TaskStatusList>();
            this.Teams = new HashSet<Team>();
            this.Users = new HashSet<User>();
            this.Organizations11 = new HashSet<Organization>();
            this.Organizations = new HashSet<Organization>();
            this.Trainings = new HashSet<Training>();
            this.NotificationTemplates = new HashSet<NotificationTemplate>();
            this.TaskScales = new HashSet<TaskScale>();
            this.ProjectSteeringGroups = new HashSet<ProjectSteeringGroup>();
            this.Tags = new HashSet<Tag>();
            this.Projects = new HashSet<Project>();
            this.Customers = new HashSet<Customer>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public Nullable<int> ParentId { get; set; }
        public Nullable<int> IndustryId { get; set; }
        public string ZipPostalCode { get; set; }
        public string City { get; set; }
        public string Phone { get; set; }
        public string Fax { get; set; }
        public string Email { get; set; }
        public string Website { get; set; }
        public string LogoLink { get; set; }
        public string OrgCode { get; set; }
        public string PostAddressLine1 { get; set; }
        public string PostAddressLine2 { get; set; }
        public string PostAddressLine3 { get; set; }
        public string PostZipPostalCode { get; set; }
        public string PostCity { get; set; }
        public string PostCountry { get; set; }
        public Nullable<int> CountryId { get; set; }
        public string Address { get; set; }
        public string ContactName { get; set; }
        public string State { get; set; }
        public string VisitingAddress { get; set; }
        public string VisitingZip { get; set; }
        public string VisitingCity { get; set; }
        public Nullable<int> VisitingCountryId { get; set; }
        public string Skype { get; set; }
        public string ContactEmail { get; set; }
        public string ContactPhone { get; set; }
        public string Twitter { get; set; }
        public string Facebook { get; set; }
        public string LinkedIn { get; set; }
        public string Pinterest { get; set; }
        public string IPSGroup { get; set; }
        public string VisitingState { get; set; }
        public Nullable<int> ContactTitleId { get; set; }
        public Nullable<int> ContactRoleId { get; set; }
        public Nullable<int> ParentOrganizationId { get; set; }
        public Nullable<int> OrganizationTypeId { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> UpdatedOn { get; set; }
        public Nullable<int> UpdatedBy { get; set; }
        public string CSVFile { get; set; }
    
        public virtual Country Country { get; set; }
        public virtual Country Country1 { get; set; }
        public virtual ICollection<Department> Departments { get; set; }
        public virtual Industry Industry { get; set; }
        public virtual LookupItem LookupItem { get; set; }
        public virtual LookupItem LookupItem1 { get; set; }
        public virtual ICollection<Organization> Organizations1 { get; set; }
        public virtual Organization Organization1 { get; set; }
        public virtual ICollection<ScorecardGoal> ScorecardGoals { get; set; }
        public virtual ICollection<ScorecardPerspective> ScorecardPerspectives { get; set; }
        public virtual ICollection<PerformanceGroup> PerformanceGroups { get; set; }
        public virtual ICollection<ProfileCategory> ProfileCategories { get; set; }
        public virtual ICollection<Profile> Profiles { get; set; }
        public virtual ICollection<ProfileType> ProfileTypes { get; set; }
        public virtual ICollection<Question> Questions { get; set; }
        public virtual ICollection<Skill> Skills { get; set; }
        public virtual ICollection<TaskCategoryList> TaskCategoryLists { get; set; }
        public virtual ICollection<TaskPriorityList> TaskPriorityLists { get; set; }
        public virtual ICollection<TaskStatusList> TaskStatusLists { get; set; }
        public virtual ICollection<Team> Teams { get; set; }
        public virtual ICollection<User> Users { get; set; }
        public virtual ICollection<Organization> Organizations11 { get; set; }
        public virtual ICollection<Organization> Organizations { get; set; }
        public virtual ICollection<Training> Trainings { get; set; }
        public virtual ICollection<NotificationTemplate> NotificationTemplates { get; set; }
        public virtual ICollection<TaskScale> TaskScales { get; set; }
        public virtual ICollection<ProjectSteeringGroup> ProjectSteeringGroups { get; set; }
        public virtual ICollection<Tag> Tags { get; set; }
        public virtual ICollection<Project> Projects { get; set; }
        public virtual ICollection<Customer> Customers { get; set; }
    }
}
