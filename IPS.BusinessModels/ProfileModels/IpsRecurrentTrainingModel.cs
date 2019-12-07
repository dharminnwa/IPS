using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProfileModels
{
    public class IpsRecurrentTrainingModel
    {
        public int Id { get; set; }
        public int StageGroupId { get; set; }
        public Nullable<int> StageId { get; set; }
        public Nullable<int> UserId { get; set; }
        public bool EmailNotification { get; set; }
        public bool SMSNotification { get; set; }
        public Nullable<int> GreenAlarmParticipantTemplateId { get; set; }
        public Nullable<int> GreenAlarmTime { get; set; }
        public Nullable<int> YellowAlarmParticipantTemplateId { get; set; }
        public Nullable<int> YellowAlarmTime { get; set; }
        public Nullable<int> RedAlarmParticipantTemplateId { get; set; }
        public Nullable<int> RedAlarmTime { get; set; }
        public Nullable<int> ExternalStartNotificationTemplateId { get; set; }
        public Nullable<int> ExternalCompletedNotificationTemplateId { get; set; }
        public Nullable<int> ExternalResultsNotificationTemplateId { get; set; }
        public Nullable<int> EvaluatorStartNotificationTemplateId { get; set; }
        public Nullable<int> EvaluatorCompletedNotificationTemplateId { get; set; }
        public Nullable<int> EvaluatorResultsNotificationTemplateId { get; set; }
        public Nullable<int> TrainerStartNotificationTemplateId { get; set; }
        public Nullable<int> TrainerCompletedNotificationTemplateId { get; set; }
        public Nullable<int> TrainerResultsNotificationTemplateId { get; set; }
        public Nullable<int> ManagerStartNotificationTemplateId { get; set; }
        public Nullable<int> ManagerCompletedNotificationTemplateId { get; set; }
        public Nullable<int> ManagerResultsNotificationTemplateId { get; set; }
        public Nullable<int> ManagerId { get; set; }
        public Nullable<int> TrainerId { get; set; }
        public Nullable<System.DateTime> InvitedAt { get; set; }
        public Nullable<int> GreenAlarmEvaluatorTemplateId { get; set; }
        public Nullable<int> GreenAlarmManagerTemplateId { get; set; }
        public Nullable<int> GreenAlarmTrainerTemplateId { get; set; }
        public Nullable<int> YellowAlarmEvaluatorTemplateId { get; set; }
        public Nullable<int> YellowAlarmManagerTemplateId { get; set; }
        public Nullable<int> YellowAlarmTrainerTemplateId { get; set; }
        public Nullable<int> RedAlarmEvaluatorTemplateId { get; set; }
        public Nullable<int> RedAlarmManagerTemplateId { get; set; }
        public Nullable<int> RedAlarmTrainerTemplateId { get; set; }
        public string RecurrentTrainningFrequency { get; set; }
        public Nullable<int> HowMany { get; set; }
        public Nullable<int> MetricId { get; set; }
        public Nullable<int> HowManyActions { get; set; }
        public Nullable<int> HowManySet { get; set; }
        public Nullable<int> PersonalTrainingReminderNotificationTemplateId { get; set; }
        public Nullable<int> ProfileTrainingReminderNotificationTemplateId { get; set; }

        public Nullable<int> ProjectManagerStartNotificationTemplateId { get; set; }
        public Nullable<int> ProjectManagerCompletedNotificationTemplateId { get; set; }
        public Nullable<int> ProjectManagerResultsNotificationTemplateId { get; set; }
        public Nullable<int> FinalScoreManagerStartNotificationTemplateId { get; set; }
        public Nullable<int> FinalScoreManagerCompletedNotificationTemplateId { get; set; }
        public Nullable<int> FinalScoreManagerResultsNotificationTemplateId { get; set; }
        public Nullable<int> GreenAlarmProjectManagerTemplateId { get; set; }
        public Nullable<int> YellowAlarmProjectManagerTemplateId { get; set; }
        public Nullable<int> RedAlarmProjectManagerTemplateId { get; set; }
        public Nullable<int> GreenAlarmFinalScoreManagerTemplateId { get; set; }
        public Nullable<int> YellowAlarmFinalScoreManagerTemplateId { get; set; }
        public Nullable<int> RedAlarmFinalScoreManagerTemplateId { get; set; }

    }
}
