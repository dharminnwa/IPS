using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProfileModels
{
    public class IpsStageModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int StageGroupId { get; set; }
        public System.DateTime StartDateTime { get; set; }
        public System.DateTime EndDateTime { get; set; }
        public bool IsPaused { get; set; }
        public bool IsStopped { get; set; }
    }
}
