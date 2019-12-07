
using IPS.BusinessModels.ProjectModel;
using IPS.Data;
using IPS.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProfileModels
{
    public class IpsProfile
    {
        public IpsProfile()
        {
            Participants = new List<User>();
            Evaluators = new List<User>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public ProfileTypeEnum ProfileTypeId { get; set; }
        public List<User> Participants { get; set; }
        public List<User> Evaluators { get; set; }
        public int? EvalutorId { get; set; }
        public int? EvalutorRoleId { get; set; }
        public int ParticipantUserId { get; set; }
        public bool IsActive { get; set; }
        public bool IsManagerProfile { get; set; }
        public IpsProjectModel Project { get; set; }
    }
}
