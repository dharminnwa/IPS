using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
   public class IpsMilestoneAgreementGoal
    {
        public int Id { get; set; }
        public int StageId { get; set; }
        public int ParticipantId { get; set; }
        public Nullable<decimal> Goal { get; set; }
        public int EvaluationAgreementId { get; set; }
    }
}
