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
    
    public partial class PortfolioProject
    {
        public PortfolioProject()
        {
            this.PortfolioImages = new HashSet<PortfolioImage>();
        }
    
        public int PortfolioProjectID { get; set; }
        public Nullable<int> PortfolioCategoryID { get; set; }
        public string ProjectName { get; set; }
        public string ProjectTitle { get; set; }
        public string ProjectDate { get; set; }
        public string AboutCompany { get; set; }
        public string ProjectResult { get; set; }
        public string ProjectUrl { get; set; }
        public Nullable<bool> isDeleted { get; set; }
    
        public virtual PortfolioCategory PortfolioCategory { get; set; }
        public virtual ICollection<PortfolioImage> PortfolioImages { get; set; }
    }
}
