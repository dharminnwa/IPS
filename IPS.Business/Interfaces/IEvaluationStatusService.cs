namespace IPS.Business.Interfaces
{
    public interface IEvaluationStatusService
    {
        void SetEvaluationStatus(int? stageId, int? stageEvolutionId, int participantId, bool isOpen = false);
        void SetEvaluationStatusInvited(int? stageId, int? stageEvolutionId, int participantId);
    }
}
