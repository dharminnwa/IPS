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
    
    public partial class NotificationTemplateType
    {
        public NotificationTemplateType()
        {
            this.NotificationTemplates = new HashSet<NotificationTemplate>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
    
        public virtual ICollection<NotificationTemplate> NotificationTemplates { get; set; }
    }
}