using IPS.Business;
using log4net;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IPSScheduler.Jobs
{
    public class TrainingSMSJob : IJob
    {
        private static readonly ILog Log = LogManager.GetLogger("StartTrainingSMSJob");
        private static string DateFormat = "yyMMddHHmm";

        public static string TrainingId = "trainingId";
        public static string UserId = "userId";
        public static string TrainingType = "trainingType";


        public static string generateJobKey(int taskId, DateTime stageStartTime)
        {
            return String.Format("{0}_{1}", taskId, stageStartTime.ToString(DateFormat));
        }
        public static string generateRecurrenceJobKey(int taskId, DateTime stageStartTime)
        {
            return String.Format("{0}_{1}_{2}", "Recurrence", taskId, stageStartTime.ToString(DateFormat));
        }

        public void Execute(IJobExecutionContext context)
        {
            Log.Debug(String.Format("Training SMS Job! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group));
            try
            {
                JobDataMap dataMap = context.JobDetail.JobDataMap;
                int taskId = (Int32)dataMap[TrainingId];
                int userId = (Int32)dataMap[UserId];
                NotificationService ntfService = new NotificationService();
                ntfService.SendTrainingSMSNotification(taskId, userId);
                Log.Info(String.Format("Training SMS Job execution completed. Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group));
            }
            catch (Exception ex)
            {
                Log.Error(String.Format("Training SMS Job execution failed! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group), ex);
            }
        }
    }
}