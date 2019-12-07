using IPS.BusinessModels.UserModel;
using IPS.Data;

namespace IPS.BusinessModels.Entities
{
    public class IpsUserProfile
    {
        public IpsProfile Profile { get; set; }
        public IpsStageEvolution Stage { get; set; }
        public bool PreviousStage { get; set; }
        public EvaluationParticipant Participant { get; set; }
        public User Evaluatee { get; set; }
        public bool IsSurveyPassed { get; set; }
        public bool IsParticipantPassedSurvey { get; set; }
        public bool IsKPISet { get; set; }
        public bool IsFinalKPISet { get; set; }
        public bool IsExpired { get; set; }
        public bool IsBlocked { get; set; }
        public bool IsRCTAdded { get; set; }
        public bool IsPaused { get; set; }
        public bool IsStopped { get; set; }
        public EvaluationStatus Status { get; set; }
        public bool NeedToEvaluateTextQuestions { get; set; }
        public bool IsLastEvaluatedStage { get; set; }
        public bool IsLastStage { get; set; } 
        public IpsUserModel User { get; set; }
    }
}
