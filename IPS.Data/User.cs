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
    
    public partial class User
    {
        public User()
        {
            this.Departments = new HashSet<Department>();
            this.Link_TeamUsers = new HashSet<Link_TeamUsers>();
            this.Departments1 = new HashSet<Department>();
            this.JobPositions = new HashSet<JobPosition>();
            this.Teams = new HashSet<Team>();
            this.TaskCategoryLists = new HashSet<TaskCategoryList>();
            this.TaskLists = new HashSet<TaskList>();
            this.TaskPriorityLists = new HashSet<TaskPriorityList>();
            this.TaskStatusLists = new HashSet<TaskStatusList>();
            this.Bookmarks = new HashSet<Bookmark>();
            this.Link_ProjectUsers = new HashSet<Link_ProjectUsers>();
            this.TaskScales = new HashSet<TaskScale>();
            this.Trainings = new HashSet<Training>();
            this.TrainingMaterialRatings = new HashSet<TrainingMaterialRating>();
            this.Profiles = new HashSet<Profile>();
            this.Profiles1 = new HashSet<Profile>();
            this.UserRecurrentNotificationSettings = new HashSet<UserRecurrentNotificationSetting>();
            this.UserRecurrentNotificationSettings1 = new HashSet<UserRecurrentNotificationSetting>();
            this.Projects = new HashSet<Project>();
            this.ProspectingGoalInfoes = new HashSet<ProspectingGoalInfo>();
            this.Customers = new HashSet<Customer>();
            this.ProspectingCustomerOfferDetails = new HashSet<ProspectingCustomerOfferDetail>();
            this.IpsAttachmentUsers = new HashSet<IpsAttachmentUser>();
            this.Stages = new HashSet<Stage>();
            this.Stages1 = new HashSet<Stage>();
        }
    
        public int Id { get; set; }
        public string UserKey { get; set; }
        public int UserTypeId { get; set; }
        public Nullable<int> OrganizationId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Zip { get; set; }
        public string ImagePath { get; set; }
        public string Skype { get; set; }
        public string Twitter { get; set; }
        public string Facebook { get; set; }
        public string Linkedin { get; set; }
        public string MobileNo { get; set; }
        public string WorkPhoneNo { get; set; }
        public string PrivatePhoneNo { get; set; }
        public string WorkEmail { get; set; }
        public string PrivateEmail { get; set; }
        public Nullable<int> CultureId { get; set; }
        public string WebSite { get; set; }
        public string Remarks { get; set; }
        public bool IsActive { get; set; }
        public Nullable<System.DateTime> BirthDate { get; set; }
        public string Gender { get; set; }
    
        public virtual Culture Culture { get; set; }
        public virtual ICollection<Department> Departments { get; set; }
        public virtual ICollection<Link_TeamUsers> Link_TeamUsers { get; set; }
        public virtual UserType UserType { get; set; }
        public virtual ICollection<Department> Departments1 { get; set; }
        public virtual ICollection<JobPosition> JobPositions { get; set; }
        public virtual ICollection<Team> Teams { get; set; }
        public virtual Organization Organization { get; set; }
        public virtual ICollection<TaskCategoryList> TaskCategoryLists { get; set; }
        public virtual ICollection<TaskList> TaskLists { get; set; }
        public virtual ICollection<TaskPriorityList> TaskPriorityLists { get; set; }
        public virtual ICollection<TaskStatusList> TaskStatusLists { get; set; }
        public virtual ICollection<Bookmark> Bookmarks { get; set; }
        public virtual ICollection<Link_ProjectUsers> Link_ProjectUsers { get; set; }
        public virtual ICollection<TaskScale> TaskScales { get; set; }
        public virtual ICollection<Training> Trainings { get; set; }
        public virtual ICollection<TrainingMaterialRating> TrainingMaterialRatings { get; set; }
        public virtual ICollection<Profile> Profiles { get; set; }
        public virtual ICollection<Profile> Profiles1 { get; set; }
        public virtual ICollection<UserRecurrentNotificationSetting> UserRecurrentNotificationSettings { get; set; }
        public virtual ICollection<UserRecurrentNotificationSetting> UserRecurrentNotificationSettings1 { get; set; }
        public virtual ICollection<Project> Projects { get; set; }
        public virtual ICollection<ProspectingGoalInfo> ProspectingGoalInfoes { get; set; }
        public virtual ICollection<Customer> Customers { get; set; }
        public virtual ICollection<ProspectingCustomerOfferDetail> ProspectingCustomerOfferDetails { get; set; }
        public virtual ICollection<IpsAttachmentUser> IpsAttachmentUsers { get; set; }
        public virtual ICollection<Stage> Stages { get; set; }
        public virtual ICollection<Stage> Stages1 { get; set; }
    }
}
