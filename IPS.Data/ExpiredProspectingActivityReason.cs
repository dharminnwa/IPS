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
    
    public partial class ExpiredProspectingActivityReason
    {
        public int Id { get; set; }
        public int ProspectingActivityId { get; set; }
        public string Reason { get; set; }
        public System.DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
    
        public virtual ProspectingActivity ProspectingActivity { get; set; }
    }
}