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
    
    public partial class MeasureUnit
    {
        public MeasureUnit()
        {
            this.Scales = new HashSet<Scale>();
            this.ProspectingGoalScales = new HashSet<ProspectingGoalScale>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
    
        public virtual ICollection<Scale> Scales { get; set; }
        public virtual ICollection<ProspectingGoalScale> ProspectingGoalScales { get; set; }
    }
}
