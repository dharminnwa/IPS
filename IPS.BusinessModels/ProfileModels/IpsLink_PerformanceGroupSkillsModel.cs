using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.TrainingDiaryModels;
using IPS.BusinessModels.TrainingModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProfileModels
{
   public class IpsLink_PerformanceGroupSkillsModel
    {
        public int Id { get; set; }
        public int PerformanceGroupId { get; set; }
        public int SkillId { get; set; }
        public Nullable<int> SubSkillId { get; set; }
        public Nullable<decimal> Benchmark { get; set; }
        public string Weight { get; set; }
        public string CSF { get; set; }
        public string Action { get; set; }

        public virtual IpsSkillModel Skill { get; set; }
        public virtual IpsSkillModel Skill1 { get; set; }
        public virtual List<IpsQuestionModel> Questions { get; set; }
        public virtual List<IpsTrainingModel> Trainings { get; set; }
    }
}
