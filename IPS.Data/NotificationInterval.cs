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
    
    public partial class NotificationInterval
    {
        public NotificationInterval()
        {
            this.Link_Training_NotificationType_NotificationInterval = new HashSet<Link_Training_NotificationType_NotificationInterval>();
        }
    
        public int NotificationIntervalId { get; set; }
        public string Name { get; set; }
    
        public virtual ICollection<Link_Training_NotificationType_NotificationInterval> Link_Training_NotificationType_NotificationInterval { get; set; }
    }
}
