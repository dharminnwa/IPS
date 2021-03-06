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
    
    public partial class Department
    {
        public Department()
        {
            this.Users = new HashSet<User>();
            this.Teams = new HashSet<Team>();
            this.TaskCategoryLists = new HashSet<TaskCategoryList>();
            this.TaskPriorityLists = new HashSet<TaskPriorityList>();
            this.TaskStatusLists = new HashSet<TaskStatusList>();
            this.Departments1 = new HashSet<Department>();
            this.TaskScales = new HashSet<TaskScale>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public Nullable<int> OrganizationId { get; set; }
        public string Description { get; set; }
        public Nullable<int> ManagerId { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
        public Nullable<int> ParentId { get; set; }
    
        public virtual User User { get; set; }
        public virtual ICollection<User> Users { get; set; }
        public virtual ICollection<Team> Teams { get; set; }
        public virtual Organization Organization { get; set; }
        public virtual ICollection<TaskCategoryList> TaskCategoryLists { get; set; }
        public virtual ICollection<TaskPriorityList> TaskPriorityLists { get; set; }
        public virtual ICollection<TaskStatusList> TaskStatusLists { get; set; }
        public virtual ICollection<Department> Departments1 { get; set; }
        public virtual Department Department1 { get; set; }
        public virtual ICollection<TaskScale> TaskScales { get; set; }
    }
}
