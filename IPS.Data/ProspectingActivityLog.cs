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
    
    public partial class ProspectingActivityLog
    {
        public int Id { get; set; }
        public Nullable<int> ProspectingActivityId { get; set; }
        public string Event { get; set; }
        public Nullable<System.DateTime> EventTime { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> CreatedBy { get; set; }
    
        public virtual ProspectingActivity ProspectingActivity { get; set; }
    }
}
