using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProjectModel
{
    public class IpsProjectTaskModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int? ProjetId { get; set; }
        public int? AssignedToUserId { get; set; }
    }
}
