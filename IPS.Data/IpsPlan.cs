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
    
    public partial class IpsPlan
    {
        public IpsPlan()
        {
            this.IpsPlanRoles = new HashSet<IpsPlanRole>();
            this.IPSPlanFeatures = new HashSet<IPSPlanFeature>();
        }
    
        public int PlanID { get; set; }
        public Nullable<int> PlanType { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Nullable<decimal> MonthlyPrice { get; set; }
        public Nullable<decimal> AnualPrice { get; set; }
        public Nullable<System.DateTime> CreatedDate { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<bool> IsDeleted { get; set; }
    
        public virtual ICollection<IpsPlanRole> IpsPlanRoles { get; set; }
        public virtual LookupItem LookupItem { get; set; }
        public virtual ICollection<IPSPlanFeature> IPSPlanFeatures { get; set; }
    }
}