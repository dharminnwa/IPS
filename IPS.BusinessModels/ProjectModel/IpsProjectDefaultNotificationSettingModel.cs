﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProjectModel
{
  public  class IpsProjectDefaultNotificationSettingModel
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public Nullable<int> ParticipantsStartNotificationId { get; set; }
        public Nullable<int> ParticipantsCompletedNotificationId { get; set; }
        public Nullable<int> ParticipantsResultNotificationId { get; set; }
        public Nullable<int> EvaluatorsStartNotificationId { get; set; }
        public Nullable<int> EvaluatorsCompletedNotificationId { get; set; }
        public Nullable<int> EvaluatorsResultNotificationId { get; set; }
        public Nullable<int> TrainersStartNotificationId { get; set; }
        public Nullable<int> TrainersCompletedNotificationId { get; set; }
        public Nullable<int> TrainersResultNotificationId { get; set; }
        public Nullable<int> ManagersStartNotificationId { get; set; }
        public Nullable<int> ManagersCompletedNotificationId { get; set; }
        public Nullable<int> ManagersResultNotificationId { get; set; }
        public Nullable<int> FinalScoreManagersStartNotificationId { get; set; }
        public Nullable<int> FinalScoreManagersCompletedNotificationId { get; set; }
        public Nullable<int> FinalScoreManagersResultNotificationId { get; set; }
        public Nullable<int> ProjectManagersStartNotificationId { get; set; }
        public Nullable<int> ProjectManagersCompletedNotificationId { get; set; }
        public Nullable<int> ProjectManagersResultNotificationId { get; set; }
        public Nullable<int> ParticipantGreenNotificationId { get; set; }
        public Nullable<int> ParticipantYellowNotificationId { get; set; }
        public Nullable<int> ParticipantRedNotificationId { get; set; }
        public Nullable<int> EvaluatorGreenNotificationId { get; set; }
        public Nullable<int> EvaluatorYellowNotificationId { get; set; }
        public Nullable<int> EvaluatorRedNotificationId { get; set; }
        public Nullable<int> ManagerGreenNotificationId { get; set; }
        public Nullable<int> ManagerYellowNotificationId { get; set; }
        public Nullable<int> ManagerRedNotificationId { get; set; }
        public Nullable<int> TrainerGreenNotificationId { get; set; }
        public Nullable<int> TrainerYellowNotificationId { get; set; }
        public Nullable<int> TrainerRedNotificationId { get; set; }
        public Nullable<int> FinalScoreManagersGreenNotificationId { get; set; }
        public Nullable<int> FinalScoreManagersYellowNotificationId { get; set; }
        public Nullable<int> FinalScoreManagersRedNotificationId { get; set; }
        public Nullable<int> ProjectManagersGreenNotificationId { get; set; }
        public Nullable<int> ProjectManagersYellowNotificationId { get; set; }
        public Nullable<int> ProjectManagersRedNotificationId { get; set; }
        public Nullable<int> GreenAlarmBefore { get; set; }
        public Nullable<int> YellowAlarmBefore { get; set; }
        public Nullable<int> RedAlarmBefore { get; set; }
        public bool EmailNotification { get; set; }
        public bool SmsNotification { get; set; }
    }
}