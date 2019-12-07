using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ResourceModels
{
    public class IpsOperationModel
    { 
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsPageLevel { get; set; }
    }
}
