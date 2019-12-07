using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsKTEvaluationInfo
    {
        public string ProfileName { get; set; }
        public List<IpsKTEvaluationAnswer> Answers { get; set; }
    }
}
