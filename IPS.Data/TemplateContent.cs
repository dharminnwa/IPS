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
    
    public partial class TemplateContent
    {
        public TemplateContent()
        {
            this.TemplateContentImages = new HashSet<TemplateContentImage>();
        }
    
        public int TemplateContentID { get; set; }
        public string Title { get; set; }
        public Nullable<int> TemplateCategoryID { get; set; }
        public string Description { get; set; }
        public Nullable<int> LanguageID { get; set; }
        public Nullable<bool> IsDeleted { get; set; }
    
        public virtual TemplateCategory TemplateCategory { get; set; }
        public virtual ICollection<TemplateContentImage> TemplateContentImages { get; set; }
    }
}
