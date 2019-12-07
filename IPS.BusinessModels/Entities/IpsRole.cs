using IPS.AuthData.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsRole
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int OrganizationId {get;set;}
        public int RoleLevel { get; set; }
    }
}
