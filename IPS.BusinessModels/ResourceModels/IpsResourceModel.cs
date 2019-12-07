using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ResourceModels
{
    public class IpsResourceModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int? ParentResourceId  { get; set; }
        public bool IsPage { get; set; }

    }
}
