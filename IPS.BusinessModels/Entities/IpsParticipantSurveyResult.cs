using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsParticipantSurveyResult
    {
        public int ParticipantId { get; set; }
        public int? StageId { get; set; }
        public int? StageEvolutionId { get; set; }
        public List<SurveyAnswer> Answers { get; set; }
    }
}
