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
    
    public partial class Link_ProjectUsers
    {
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public int SteeringGroupId { get; set; }
    
        public virtual User User { get; set; }
        public virtual ProjectRole ProjectRole { get; set; }
        public virtual ProjectSteeringGroup ProjectSteeringGroup { get; set; }
        public virtual Project Project { get; set; }
    }
}
