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
    
    public partial class TaskCategoryListItem
    {
        public TaskCategoryListItem()
        {
            this.Tasks = new HashSet<Task>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int CategoryListId { get; set; }
        public string Color { get; set; }
        public string TextColor { get; set; }
    
        public virtual TaskCategoryList TaskCategoryList { get; set; }
        public virtual ICollection<Task> Tasks { get; set; }
    }
}
