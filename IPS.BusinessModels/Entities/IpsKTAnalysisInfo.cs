using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsKTAnalysisInfo
    {
        public string ProfileName { get; set; }
        public List<IpsKTAnalysisAnswer> Answers { get; set; }
    }
}
