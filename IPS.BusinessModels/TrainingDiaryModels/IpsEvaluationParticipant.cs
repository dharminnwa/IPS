using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
    public class IpsEvaluationParticipant
    {
        public int StageGroupId { get; set; }
        public int UserId { get; set; }
        public bool IsLocked { get; set; }
        public int EvaluationRoleId { get; set; }
        public int Id { get; set; }
        public Nullable<int> EvaluateeId { get; set; }
        public Nullable<bool> IsSelfEvaluation { get; set; }
        public Nullable<System.DateTime> Invited { get; set; }
        public bool IsScoreManager { get; set; }
    }
}
