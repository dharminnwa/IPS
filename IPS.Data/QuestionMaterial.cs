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
    
    public partial class QuestionMaterial
    {
        public int QuestionId { get; set; }
        public Nullable<System.Guid> DocumentId { get; set; }
        public int MaterialType { get; set; }
        public string Link { get; set; }
    
        public virtual Document Document { get; set; }
        public virtual Question Question { get; set; }
    }
}