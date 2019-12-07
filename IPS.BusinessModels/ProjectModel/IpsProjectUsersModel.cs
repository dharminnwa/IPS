using IPS.BusinessModels.TrainingDiaryModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProjectModel
{
    public class IpsProjectUsersModel
    {
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public int SteeringGroupId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string RoleName { get; set; }
        public string UserImage { get; set; }
        public string Email { get; set; }
        public int? OrganizationId { get; set; }
        public IPSUserStatsModel UserInfo { get; set; }
    }
}
