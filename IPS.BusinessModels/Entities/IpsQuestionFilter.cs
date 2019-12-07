using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsQuestionFilter
    {
        public bool IsActive { get; set; }
        public bool IsInactive { get; set; }
        public bool ShowTemplatesOnly { get; set; }
        public int? OrganizationId { get; set; }
        public int? StructureLevelId { get; set; }
        public int[] Industries { get; set; }
        public int[] Skills { get; set; }
        public int[] ProfileTypes { get; set; }
        public string[] PerformanceGroups { get; set; }
        //public ICollection<Skill> Skills { get; set; }
        //public ICollection<ProfileType> ProfileTypes { get; set; }
    }
}





