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
    
    public partial class TaskPriorityListItem
    {
        public TaskPriorityListItem()
        {
            this.Tasks = new HashSet<Task>();
        }
    
        public int Id { get; set; }
        public int PriorityNo { get; set; }
        public string Name { get; set; }
        public int PriorityListId { get; set; }
        public string Description { get; set; }
    
        public virtual TaskPriorityList TaskPriorityList { get; set; }
        public virtual ICollection<Task> Tasks { get; set; }
    }
}
