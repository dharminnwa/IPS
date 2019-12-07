using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.RoleModels
{
    public class IpsRoleLevelModel
    {
        public IpsRoleLevelModel() {
            ChildRoleLevel = new List<IpsRoleLevelModel>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public int? ParentRoleLevelId { get; set; }
        public int? OrganizationId { get; set; }
        public string ParentRoleLevelName { get; set; }
        public List<IpsRoleLevelModel> ChildRoleLevel { get; set; }
    }
}
