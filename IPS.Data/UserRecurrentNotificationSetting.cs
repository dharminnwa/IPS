//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace IPS.Data
{
    using System;
    using System.Collections.Generic;
    
    public partial class UserRecurrentNotificationSetting
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
        public Nullable<System.DateTime> CreatedAt { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> ModifiedAt { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
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
    
        public virtual NotificationTemplate NotificationTemplate { get; set; }
        public virtual NotificationTemplate NotificationTemplate1 { get; set; }
        public virtual NotificationTemplate NotificationTemplate2 { get; set; }
        public virtual NotificationTemplate NotificationTemplate3 { get; set; }
        public virtual NotificationTemplate NotificationTemplate4 { get; set; }
        public virtual NotificationTemplate NotificationTemplate5 { get; set; }
        public virtual NotificationTemplate NotificationTemplate6 { get; set; }
        public virtual NotificationTemplate NotificationTemplate7 { get; set; }
        public virtual NotificationTemplate NotificationTemplate8 { get; set; }
        public virtual NotificationTemplate NotificationTemplate9 { get; set; }
        public virtual NotificationTemplate NotificationTemplate10 { get; set; }
        public virtual NotificationTemplate NotificationTemplate11 { get; set; }
        public virtual NotificationTemplate NotificationTemplate12 { get; set; }
        public virtual NotificationTemplate NotificationTemplate13 { get; set; }
        public virtual NotificationTemplate NotificationTemplate14 { get; set; }
        public virtual NotificationTemplate NotificationTemplate15 { get; set; }
        public virtual NotificationTemplate NotificationTemplate16 { get; set; }
        public virtual NotificationTemplate NotificationTemplate17 { get; set; }
        public virtual NotificationTemplate NotificationTemplate18 { get; set; }
        public virtual NotificationTemplate NotificationTemplate19 { get; set; }
        public virtual NotificationTemplate NotificationTemplate20 { get; set; }
        public virtual NotificationTemplate NotificationTemplate21 { get; set; }
        public virtual NotificationTemplate NotificationTemplate22 { get; set; }
        public virtual NotificationTemplate NotificationTemplate23 { get; set; }
        public virtual NotificationTemplate NotificationTemplate24 { get; set; }
        public virtual NotificationTemplate NotificationTemplate25 { get; set; }
        public virtual User User { get; set; }
        public virtual User User1 { get; set; }
        public virtual StageGroup StageGroup { get; set; }
    }
}