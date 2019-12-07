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
    
    public partial class TrainingMaterial
    {
        public TrainingMaterial()
        {
            this.TrainingMaterialRatings = new HashSet<TrainingMaterialRating>();
        }
    
        public int Id { get; set; }
        public string Title { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Nullable<int> TrainingId { get; set; }
        public string MaterialType { get; set; }
        public string ResourceType { get; set; }
        public string Link { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
    
        public virtual Training Training { get; set; }
        public virtual ICollection<TrainingMaterialRating> TrainingMaterialRatings { get; set; }
    }
}