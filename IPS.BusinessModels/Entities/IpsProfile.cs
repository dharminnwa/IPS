using IPS.BusinessModels.ProjectModel;
using IPS.Data;
using IPS.Data.Enums;
using System.Collections.Generic;

namespace IPS.BusinessModels.Entities
{
    public class IpsProfile
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ProfileTypeEnum ProfileTypeId { get; set; }
        public List<User> Participants { get; set; }
        public int? EvalutorId { get; set; }
        public IpsProjectModel Project { get; set; }
    }
}