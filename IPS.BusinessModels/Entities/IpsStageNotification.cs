using System;
using IPS.Data;

namespace IPS.BusinessModels.Entities
{
    public class IpsStageNotification
    {
        public string Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime DueDate { get; set; }
        public bool EmailNotification { get; set; }
        public bool SMSNotification { get; set; }
        public int? StageId { get; set; }
        public int? StageEvolutionId { get; set; }
        public StageGroup StageGroup { get; set; }
        public int? ExternalCompletedNotificationTemplateId { get; set; }
        public int? EvaluatorCompletedNotificationTemplateId { get; set; }
        public int? ExternalStartNotificationTemplateId { get; set; }
        public int? EvaluatorStartNotificationTemplateId { get; set; }
        public int? TrainerStartNotificationTemplateId { get; set; }
        public int? ManagerStartNotificationTemplateId { get; set; }
        public int? TrainerCompletedNotificationTemplateId { get; set; }
        public int? ManagerCompletedNotificationTemplateId { get; set; }
        public int? ExternalResultsNotificationTemplateId { get; set; }
        public int? EvaluatorResultsNotificationTemplateId { get; set; }
        public int? TrainerResultsNotificationTemplateId { get; set; }
        public int? ManagerResultsNotificationTemplateId { get; set; }
        public int? ManagerId { get; set; }
        public int? TrainerId { get; set; }
    }
}