using Quartz;
using System;
using System.Linq;
using log4net;
using IPS.Business;
using IPS.Data;

namespace IPSScheduler.Jobs
{
    public class AlarmJob : IJob
    {
        public static string AlarmGreen = "G";
        public static string AlarmYellow = "Y";
        public static string AlarmRed = "R";

        public static string ParamStage = "stageId";
        public static string ParamAlarmType = "alarmType";

        private static string DateFormat = "yyMMddHHmm";
        private static readonly ILog Log = LogManager.GetLogger("AlarmJob");

        public static string generateJobKey(int stageId, string alarmType, DateTime alarmTime)
        {
            return String.Format("{0}_{1}_{2}", stageId, alarmType, alarmTime.ToString(DateFormat));
        }

        public void Execute(IJobExecutionContext context)
        {
            Log.Debug(String.Format("Run Alarm Job! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group));

            try
            {
                JobDataMap dataMap = context.JobDetail.JobDataMap;
                int stageId = (Int32)dataMap[ParamStage];
                String alarmType = (String)dataMap[ParamAlarmType];
                StagesService stageService = new StagesService();
                Stage stage = stageService.Get().Where(s => s.Id == stageId).FirstOrDefault();
                UserRecurrentNotificationSetting UserRecurrentNotificationSetting = null;
                if (stage.StageGroupId > 0)
                {
                    Log.Debug(String.Format("stage.StageGroupId > 0  for stage group ={0}", stage.StageGroupId));
                    UserRecurrentNotificationSetting = stageService.GetUserRecurrentNotificationSettingByStageGroupId(stage.StageGroupId);
                }
                if (stage != null)
                {
                    int? userTemplateId = null;
                    int? evaluatorTemplateId = null;
                    int? trainerTemplateId = null;
                    int? managerTemplateId = null;

                    if (UserRecurrentNotificationSetting != null)
                    {
                        Log.Debug(String.Format("UserRecurrentNotificationSetting found for stage group ={0}", stage.StageGroupId));
                        if (alarmType.Equals(AlarmGreen))
                        {
                            userTemplateId = UserRecurrentNotificationSetting.GreenAlarmParticipantTemplateId != null ? UserRecurrentNotificationSetting.GreenAlarmParticipantTemplateId.Value : stage.GreenAlarmParticipantTemplateId;
                            evaluatorTemplateId = UserRecurrentNotificationSetting.GreenAlarmEvaluatorTemplateId != null ? UserRecurrentNotificationSetting.GreenAlarmEvaluatorTemplateId.Value : stage.GreenAlarmEvaluatorTemplateId;
                            trainerTemplateId = UserRecurrentNotificationSetting.GreenAlarmTrainerTemplateId != null ? UserRecurrentNotificationSetting.GreenAlarmTrainerTemplateId.Value : stage.GreenAlarmTrainerTemplateId;
                            managerTemplateId = UserRecurrentNotificationSetting.GreenAlarmManagerTemplateId != null ? UserRecurrentNotificationSetting.GreenAlarmManagerTemplateId.Value : stage.GreenAlarmManagerTemplateId;
                        }

                        if (alarmType.Equals(AlarmYellow))
                        {
                            userTemplateId = UserRecurrentNotificationSetting.YellowAlarmParticipantTemplateId != null ? UserRecurrentNotificationSetting.YellowAlarmParticipantTemplateId.Value : stage.YellowAlarmParticipantTemplateId;
                            evaluatorTemplateId = UserRecurrentNotificationSetting.YellowAlarmEvaluatorTemplateId != null ? UserRecurrentNotificationSetting.YellowAlarmEvaluatorTemplateId.Value : stage.YellowAlarmEvaluatorTemplateId;
                            trainerTemplateId = UserRecurrentNotificationSetting.YellowAlarmTrainerTemplateId != null ? UserRecurrentNotificationSetting.YellowAlarmTrainerTemplateId.Value : stage.YellowAlarmTrainerTemplateId;
                            managerTemplateId = UserRecurrentNotificationSetting.YellowAlarmManagerTemplateId != null ? UserRecurrentNotificationSetting.YellowAlarmManagerTemplateId.Value : stage.YellowAlarmManagerTemplateId;
                        }

                        if (alarmType.Equals(AlarmRed))
                        {
                            userTemplateId = UserRecurrentNotificationSetting.RedAlarmParticipantTemplateId != null ? UserRecurrentNotificationSetting.RedAlarmParticipantTemplateId.Value : stage.RedAlarmParticipantTemplateId;
                            evaluatorTemplateId = UserRecurrentNotificationSetting.RedAlarmEvaluatorTemplateId != null ? UserRecurrentNotificationSetting.RedAlarmEvaluatorTemplateId.Value : stage.RedAlarmEvaluatorTemplateId;
                            trainerTemplateId = UserRecurrentNotificationSetting.RedAlarmTrainerTemplateId != null ? UserRecurrentNotificationSetting.RedAlarmTrainerTemplateId.Value : stage.RedAlarmTrainerTemplateId;
                            managerTemplateId = UserRecurrentNotificationSetting.RedAlarmManagerTemplateId != null ? UserRecurrentNotificationSetting.RedAlarmManagerTemplateId.Value : stage.RedAlarmManagerTemplateId;
                        }
                    }
                    else
                    {
                        Log.Debug(String.Format("No UserRecurrentNotificationSetting  for stage id ={0}", stage.Id));
                        if (alarmType.Equals(AlarmGreen))
                        {
                            userTemplateId = stage.GreenAlarmParticipantTemplateId;
                            evaluatorTemplateId = stage.GreenAlarmEvaluatorTemplateId;
                            trainerTemplateId = stage.GreenAlarmTrainerTemplateId;
                            managerTemplateId = stage.GreenAlarmManagerTemplateId;
                        }

                        if (alarmType.Equals(AlarmYellow))
                        {
                            userTemplateId = stage.YellowAlarmParticipantTemplateId;
                            evaluatorTemplateId = stage.YellowAlarmEvaluatorTemplateId;
                            trainerTemplateId = stage.YellowAlarmTrainerTemplateId;
                            managerTemplateId = stage.YellowAlarmManagerTemplateId;
                        }

                        if (alarmType.Equals(AlarmRed))
                        {
                            userTemplateId = stage.RedAlarmParticipantTemplateId;
                            evaluatorTemplateId = stage.RedAlarmEvaluatorTemplateId;
                            trainerTemplateId = stage.RedAlarmTrainerTemplateId;
                            managerTemplateId = stage.RedAlarmManagerTemplateId;
                        }
                    }




                    //EvaluationParticipantsService participantsService = new EvaluationParticipantsService();
                    //var users = participantsService.GetEvaluationParticipantsWithNoAnswers(stage.StageGroupId, stage.Id);
                    //var evaluators = participantsService.GetEvaluationEvaluatorsWithNoAnswers(stage.StageGroupId, stage.Id);

                    //NotificationService ntfService = new NotificationService();

                    //foreach (var participant in users)
                    //{
                    //    if (userTemplateId.HasValue)
                    //    {
                    //        ntfService.Notify(participant.Id, stage.Id, null, (int)userTemplateId, false);
                    //    }

                    //    if (evaluatorTemplateId.HasValue)
                    //    {
                    //        var participantEvaluators = participantsService.GetParticipantEvaluators(stage.StageGroupId, participant.Id);
                    //        if (participantEvaluators != null)
                    //            foreach (var pe in participantEvaluators.ToList())
                    //            {
                    //                ntfService.Notify(pe.Id, stage.Id, null, (int)evaluatorTemplateId, false);
                    //            }
                    //    }
                    //    if (stage.ManagerId.HasValue && managerTemplateId.HasValue)
                    //        ntfService.NotifyByUserId((int)stage.ManagerId, stage.Id, null, (int)managerTemplateId, participant);
                    //    if (stage.TrainerId.HasValue && trainerTemplateId.HasValue)
                    //        ntfService.NotifyByUserId((int)stage.TrainerId, stage.Id, null, (int)trainerTemplateId, participant);
                    //}

                    //foreach (var evaluator in evaluators)
                    //{
                    //    if (evaluatorTemplateId.HasValue)
                    //        ntfService.Notify(evaluator.Id, stage.Id, null, (int)evaluatorTemplateId, false);
                    //    if (stage.ManagerId.HasValue && managerTemplateId.HasValue)
                    //        ntfService.NotifyByUserId((int)stage.ManagerId, stage.Id, null, (int)managerTemplateId, evaluator);
                    //    if (stage.TrainerId.HasValue && trainerTemplateId.HasValue)
                    //        ntfService.NotifyByUserId((int)stage.TrainerId, stage.Id, null, (int)trainerTemplateId, evaluator);
                    //}


                    NotificationService notificationService = new NotificationService();
                    notificationService.SendNotificationTemplatesOfStage(stageId, null, userTemplateId, evaluatorTemplateId, trainerTemplateId, managerTemplateId);
                }
            }
            catch (Exception ex)
            {
                Log.Error(String.Format("Alarm Job execution failed! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group), ex);
            }
        }
    }
}