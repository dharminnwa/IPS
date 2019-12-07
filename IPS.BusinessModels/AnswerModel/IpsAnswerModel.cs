using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.TrainingDiaryModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.AnswerModel
{
    public class IpsAnswerModel
    {
        public int Id { get; set; }
        public Nullable<int> ParticipantId { get; set; }
        public int QuestionId { get; set; }
        public bool IsCorrect { get; set; }
        public Nullable<int> StageId { get; set; }
        public string Answer1 { get; set; }
        public Nullable<int> KPIType { get; set; }
        public string Comment { get; set; }

        public IpsQuestionModel Question { get; set; }
        public IpsEvaluationParticipant EvaluationParticipant { get; set; }
        public IpsStageModel Stage { get; set; }
        public IpsKpiTypeModel KPIType1 { get; set; }
    }
}
