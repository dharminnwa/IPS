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
    
    public partial class IpsPlanRole
    {
        public int PlanRoleID { get; set; }
        public Nullable<int> PlanID { get; set; }
        public Nullable<int> RoleID { get; set; }
        public Nullable<int> NoOfPersonAllowed { get; set; }
        public Nullable<bool> IsDeleted { get; set; }
    
        public virtual IpsPlan IpsPlan { get; set; }
        public virtual LookupItem LookupItem { get; set; }
    }
}