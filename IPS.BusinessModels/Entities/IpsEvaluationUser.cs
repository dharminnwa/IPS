using IPS.Data;

namespace IPS.BusinessModels.Entities
{
    public class IpsEvaluationUser
    {
        public int ParticipantId { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
        public int RoleId { get; set; }
        public int? EvaluateeId { get; set; }
        public bool? IsSelfEvaluation { get; set; }
        public bool? IsLocked { get; set; }
        public bool? IsScoreManager { get; set; }
        public string OrganizationName { get; set; }
        public User User { get; set; }
        public User Evaluatee { get; set; }
        public EvaluationStatus EvaluationStatus { get; set; }
        public bool? isKPISet { get; set; }
        public int StageGroupId { get; set; }
    }
}
