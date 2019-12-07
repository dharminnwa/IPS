using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
    public class IpsSurveyResultModel
    {
        public int Id { get; set; }
        public int ParticipantId { get; set; }
        public Nullable<int> StageId { get; set; }
        public int TimeSpent { get; set; }
        public Nullable<int> StageEvolutionId { get; set; }
    }
}
