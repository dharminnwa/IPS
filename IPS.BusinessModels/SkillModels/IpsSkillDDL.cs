using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.SkillModels
{
    public class IpsSkillDDL
    {
        public int? Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public int? ProfileId { get; set; }
        public string ProfileName { get; set; }

        public int? PerformanceGroupId { get; set; }
        public string PerformanceGroupName { get; set; }

        public int? SeqNo { get; set; }


    }

    public class IpsFilterSkillResultModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int? ProfileTypeId { get; set; }
        public string ProfileTypeName { get; set; }
        public int? ProfileLevelId { get; set; }
        public string ProfileLevelName { get; set; }
        public int? ProfileCategoryId { get; set; }
        public string ProfileCategoryName { get; set; }
        public long RowNum { get; set; }
        public int Priority { get; set; }
    }
}
