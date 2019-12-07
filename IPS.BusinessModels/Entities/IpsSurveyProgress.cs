using IPS.BusinessModels.Enums;

namespace IPS.BusinessModels.Entities
{
    public class IpsSurveyProgress : IpsEvaluationUser
    {
        public StageStatusEnum Status { get; set; }
    }
}