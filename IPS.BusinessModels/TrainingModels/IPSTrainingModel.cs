using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.UserModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingModels
{
    public class IpsTrainingModel
    {
        public IpsTrainingModel()
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
        public bool isProfileTraining { get; set; }
        public string AdditionalInfo { get; set; }
        public Nullable<int> LevelId { get; set; }
        public string Frequency { get; set; }
        public Nullable<int> Duration { get; set; }
        public Nullable<int> DurationMetricId { get; set; }
        public Nullable<int> TypeId { get; set; }
        public bool IsTemplate { get; set; }
        public Nullable<bool> IsActive { get; set; }
        public Nullable<int> OrganizationId { get; set; }
        public Nullable<System.DateTime> StartDate { get; set; }
        public Nullable<System.DateTime> EndDate { get; set; }
        public Nullable<int> HowMany { get; set; }
        public Nullable<int> ExerciseMetricId { get; set; }
        public Nullable<int> HowManySets { get; set; }
        public Nullable<int> HowManyActions { get; set; }
        public Nullable<int> UserId { get; set; }
        public Nullable<int> SkillId { get; set; }
        public bool IsNotificationBySMS { get; set; }
        public bool IsNotificationByEmail { get; set; }
        public Nullable<int> NotificationTemplateId { get; set; }
        public Nullable<int> EmailBefore { get; set; }
        public Nullable<int> SmsBefore { get; set; }
        public List<IPSTrainingMaterial> TrainingMaterials { get; set; }
        public List<IPSTrainingFeedback> TrainingFeedbacks { get; set; }
        public List<IpsSkillDDL> Skills { get; set; }
        public List<IPSLink_PerformanceGroupSkillsModel> Link_PerformanceGroupSkills { get; set; }
        public IpsUserModel User { get; set; }
        public List<IPSTrainingNote> IPSTrainingNotes { get; set; }
        public int? EvalutorRoleId { get; set; }

        public int ProfileId { get; set; }
        public string ProfileName { get; set; }
        public int StageId { get; set; }
        public string StageName { get; set; }
    }
}
