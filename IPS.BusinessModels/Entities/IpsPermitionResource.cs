using IPS.AuthData.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsRolePermission
    {
        public string RoleId { get; set; }
        public int ResourceId { get; set; }
        public string ResourseName { get; set; }
        public bool IsCreate { get; set; }
        public bool IsRead { get; set; }
        public bool IsUpdate { get; set; }
        public bool IsDelete { get; set; }
        public bool IsApplicableToOwnResources { get; set; }
        public bool IsApplicableToAllResources { get; set; }
    }
}
