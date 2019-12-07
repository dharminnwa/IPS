using IPS.BusinessModels.Entities;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProjectModel
{
    public class IpsUserProjectListModel
    {
        public IpsUserProjectListModel() {
            ActiveProfiles = new List<IpsUserProfile>();
            ExpiredProfiles = new List<IpsUserProfile>();
            CompletedProfiles = new List<IpsUserProfile>();
            HistoryProfiles = new List<IpsUserProfile>();
        }
        public int Id { get; set; }
        public string Name { get; set; }
        public string Summary { get; set; }
        public string VisionStatement { get; set; }
        public bool IsActive { get; set; }
        public System.DateTime ExpectedStartDate { get; set; }
        public System.DateTime ExpectedEndDate { get; set; }
        public string MissionStatement { get; set; }
        public List<string> GoalStatement { get; set; }
        public List<string> StratagiesStatement { get; set; }
        public int ProjectRoleId { get; set; }
        public string ProjectRoleName { get; set; }
        public List<Link_ProjectUsers> Link_ProjectUsers { get;set;}

        public List<IpsUserProfile> ActiveProfiles { get; set; }
        public List<IpsUserProfile> ExpiredProfiles { get; set; }
        public List<IpsUserProfile> CompletedProfiles { get; set; }
        public List<IpsUserProfile> HistoryProfiles { get; set; }
    }
}
