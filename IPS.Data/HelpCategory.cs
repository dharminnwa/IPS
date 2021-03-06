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
    
    public partial class HelpCategory
    {
        public HelpCategory()
        {
            this.HelpContents = new HashSet<HelpContent>();
        }
    
        public int HelpCategoryID { get; set; }
        public string Title { get; set; }
        public string Meta { get; set; }
        public string KeyWord { get; set; }
        public string Description { get; set; }
        public Nullable<int> LanguageID { get; set; }
        public Nullable<bool> IsParentCategory { get; set; }
        public Nullable<int> ParentCategoryID { get; set; }
        public Nullable<bool> IsDeleted { get; set; }
    
        public virtual ICollection<HelpContent> HelpContents { get; set; }
    }
}
