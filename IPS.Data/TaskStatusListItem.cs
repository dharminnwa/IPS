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
    
    public partial class TaskStatusListItem
    {
        public TaskStatusListItem()
        {
            this.Tasks = new HashSet<Task>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int TaskStatusListId { get; set; }
        public int SeqNo { get; set; }
    
        public virtual TaskStatusList TaskStatusList { get; set; }
        public virtual ICollection<Task> Tasks { get; set; }
    }
}
