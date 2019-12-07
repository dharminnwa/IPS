using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProfileModels
{
    public class IpsProjectProfileModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ProfileTypeId { get; set; }

        public string Description { get; set; }
        public Nullable<int> IndustryId { get; set; }
        public Nullable<int> ScaleId { get; set; }
        public int? MeasureUnitId { get; set; }
        public int KPIWeak { get; set; }
        public int KPIStrong { get; set; }
        public Nullable<int> ProjectId { get; set; }
        public bool IsActive { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public User CreatedByUser { get; set; }
        public User ModifiedByUser { get; set; }
        public ProfileType ProfileType { get; set; }
     
        public MeasureUnit MeasureUnit { get; set; }
        public Scale Scale { get; set; }
        public Project Project { get; set; }
    }
}
