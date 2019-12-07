using IPS.BusinessModels.Entities;
using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.TrainingModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
    public class IpsEvaluationAgreement
    {
        public IpsEvaluationAgreement()
        {
            this.Trainings = new List<IpsTrainingModel>();
        }

        public int StageId { get; set; }
        public int ParticipantId { get; set; }
        public int QuestionId { get; set; }
        public int KPIType { get; set; }
        public Nullable<decimal> ShortGoal { get; set; }
        public string Comment { get; set; }
        public int Id { get; set; }
        public Nullable<decimal> FinalScore { get; set; }
        public Nullable<decimal> MidGoal { get; set; }
        public Nullable<decimal> LongGoal { get; set; }
        public Nullable<decimal> FinalGoal { get; set; }

        public IpsEvaluationParticipant EvaluationParticipant { get; set; }
        public IpsQuestionModel Question { get; set; }
        public IpsStageModel Stage { get; set; }
        public List<IpsTrainingModel> Trainings { get; set; }
        public List<IpsMilestoneAgreementGoal> MilestoneAgreementGoals { get; set; }
        //public virtual KPIType KPIType1 { get; set; }
    }
}
