using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.UserModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingModels
{
  public  class IpsProjectTrainingModel
    {
        public IpsProjectTrainingModel()
        {
            TrainingMaterials = new List<IPSTrainingMaterial>();
            TrainingFeedbacks = new List<IPSTrainingFeedback>();
            Skills = new List<IpsSkillDDL>();
        }
        public int Id { get; set; }
        public string Name { get; set; }
        public string What { get; set; }
        public string How { get; set; }
        public string Why { get; set; }
        public string Frequency { get; set; }
        public Nullable<System.DateTime> StartDate { get; set; }
        public Nullable<System.DateTime> EndDate { get; set; }
        public Nullable<int> UserId { get; set; }
        public Nullable<int> SkillId { get; set; }
        public Nullable<int> DurationMetricId { get; set; }
        public Nullable<int> Duration { get; set; }
        public IpsProfile profile { get; set; }
        public List<IPSTrainingMaterial> TrainingMaterials { get; set; }
        public List<IPSTrainingFeedback> TrainingFeedbacks { get; set; }
        public List<IpsSkillDDL> Skills { get; set; }
        public List<IPSLink_PerformanceGroupSkillsModel> Link_PerformanceGroupSkills { get; set; }
        public IpsUserModel User { get; set; }
    }
}
