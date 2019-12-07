using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProjectModel
{
   public class IpsProjectSteeringGroupModel
    {
        public IpsProjectSteeringGroupModel() {
            Users = new List<IpsProjectUsersModel>();
        }
        public int Id { get; set; }
        public string Name { get; set; }
        public int ProjectId { get; set; }
        public int? RoleId { get; set; }
        public int? OrganizationId { get; set; }
        public List<IpsProjectUsersModel> Users { get; set; }
    }
}
