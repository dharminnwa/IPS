namespace IPS.Business.Interfaces
{
    public interface INotificationService
    {
        void Notify(int? stageId, int? stageEvolutionId, int templateId);
        void Notify(int participantId, int? stageId, int? stageEvolutionId, int templateId);
        void Notify(int[] participants, int? stageId, int? stageEvolutionId, int templateId);
        void NotifyByUserId(int userId, int? stageId, int? stageEvolutionId, int templateId);
        string GetUICompleteMessage(int participantId, int? stageId, int? stageEvolutionId);
        string GetUIStartMessage(int participantId, int? stageId, int? stageEvolutionId);
        void SendCompleteNotification(int participantId, int? stageId, int? stageEvolutionId);
        void SendResultsNotification(int participantId, int? stageId, int? stageEvolutionId);
        void SendParticipantStageResultNotification(int participantUserId, int? stageId, int? stageEvolutionId, int participantId);

        void SendStartNewStageNotification(int? stageId, int? stageEvolutionId, bool toNotInvitedOnly);
        void SendTextEvaluationNotification(int? stageId, int? stageEvolutionId, int participantId);

        void SendNotificationTemplatesOfStage(int? stageId, int? stageEvolutionId, int? participantTemplateId, int? evaluatorTemplateId, int? trainerTemplateId, int? managerTemplateId);
        void SendParticipantNotificationTemplatesOfStage(int stageId, int? stageEvolutionId, int? participantTemplateId, int? evaluatorTemplateId, int participantId);
    }
}
