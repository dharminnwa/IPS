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
    
    public partial class IPSEMailAttachment
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public int IPSEmailId { get; set; }
    
        public virtual IpsEmail IpsEmail { get; set; }
    }
}