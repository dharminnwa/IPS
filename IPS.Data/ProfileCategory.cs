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
    
    public partial class ProfileCategory
    {
        public ProfileCategory()
        {
            this.Profiles = new HashSet<Profile>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public Nullable<int> OrganizationId { get; set; }
    
        public virtual ICollection<Profile> Profiles { get; set; }
        public virtual Organization Organization { get; set; }
    }
}
