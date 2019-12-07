using IPS.BusinessModels.ProfileModels;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
    public class IpsTrainingDiary
    {
        public IpsTrainingDiary()
        {
            IpsTrainingDiaryStages = new List<IpsTrainingDiaryStage>();
        }
        
        public EvaluationParticipant EvaluationParticipant { get; set; }
        public IpsProfile Profile { get; set; }
        public List<IpsTrainingDiaryStage> IpsTrainingDiaryStages { get; set; }
    }
}
