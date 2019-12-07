using System.Collections.Generic;

namespace IPS.BusinessModels.Entities
{
    public class IpsSurveyAnswerAgreement
    {
        public int AnswerId { get; set; }
        public bool InDevContract { get; set; }
        public IEnumerable<int> TrainingsId { get; set; }
        public string Comment { get; set; }
    }
}