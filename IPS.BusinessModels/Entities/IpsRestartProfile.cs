using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
   public class IpsRestartProfile
    {
        public int ProfileId { get; set; }
        public int ProfileTypeId { get; set; }
        public string ProfileTypeName { get; set; }
        public int StageGroupId { get; set; }
    }
}
