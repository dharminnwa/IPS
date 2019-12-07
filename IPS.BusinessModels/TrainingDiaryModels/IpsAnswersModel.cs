using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
    public class IpsAnswersModel
    {
        public int Id { get; set; }
        public Nullable<int> ParticipantId { get; set; }
        public int QuestionId { get; set; }
        public bool IsCorrect { get; set; }
        public Nullable<int> StageId { get; set; }
        public string Answer1 { get; set; }
        public Nullable<int> KPIType { get; set; }
        public string Comment { get; set; }
    }
}
