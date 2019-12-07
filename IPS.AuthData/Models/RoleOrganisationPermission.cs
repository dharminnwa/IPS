using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models
{
    public class RoleOrganisationPermission
    {
        public RoleOrganisationPermission()
        {

        }
        public int Id { get; set; }
        public string RoleId { get; set; }
        public int ResourceId { get; set; }
        public int organisationID { get; set; }
        public int DepartmentID { get; set; }
        public int TeamID { get; set; }
        public int TeamMemberID { get; set; }
        public Operations Operations { get; set; }
        public bool IsApplicableToOwnResources { get; set; }
        public bool IsApplicableToAllResources { get; set; }
        public virtual ApplicationRole Role { get; set; }
        public virtual Resource Resource { get; set; }
    }
}

