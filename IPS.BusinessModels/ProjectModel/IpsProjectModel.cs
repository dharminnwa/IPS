using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProjectModel
{
    public class IpsProjectModel
    {
        public IpsProjectModel()
        {
            ProjectUsers = new List<IpsProjectUsersModel>();
            ProjectGoals = new List<IpsProjectGoalModel>();
            ProjectSteeringGroups = new List<IpsProjectSteeringGroupModel>();
            ProjectGlobalSettings = new List<IpsProjectGlobalSettingModel>();
            ProjectDefaultNotificationSettings = new List<IpsProjectDefaultNotificationSettingModel>();
        }
        public int Id { get; set; }
        public string Name { get; set; }
        public string Summary { get; set; }
        public string VisionStatement { get; set; }
        public bool IsActive { get; set; }
        public System.DateTime ExpectedStartDate { get; set; }
        public System.DateTime ExpectedEndDate { get; set; }
        public string MissionStatement { get; set; }

        public List<IpsProjectUsersModel> ProjectUsers { get; set; }
        public List<IpsProjectGoalModel> ProjectGoals { get; set; }
        public List<IpsProjectSteeringGroupModel> ProjectSteeringGroups { get; set; }
        public List<IpsProjectGlobalSettingModel> ProjectGlobalSettings { get; set; }
        public List<IpsProjectDefaultNotificationSettingModel> ProjectDefaultNotificationSettings { get; set; }
    }
}
