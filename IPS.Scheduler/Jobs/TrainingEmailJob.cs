using IPS.Business;
using log4net;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IPSScheduler.Jobs
{
    public class TrainingEmailJob : IJob
    {
        private static readonly ILog Log = LogManager.GetLogger("StartTrainingEmailJob");
        private static string DateFormat = "yyMMddHHmm";

        public static string TrainingId = "trainingId";
        public static string UserId = "userId";
        public static string TrainingType = "trainingType";
        public static string StartDate = "startDate";
        public static string EndDate = "endDate";

        public static string generateJobKey(int taskId, DateTime stageStartTime)
        {
            return String.Format("{0}_{1}", taskId, stageStartTime.ToString(DateFormat));
        }
        public static string generateRecurrenceJobKey(int taskId, DateTime stageStartTime, int? userId)
        {
            return String.Format("{0}_{1}_{2}_{3}", "Recurrence", taskId, stageStartTime.ToString(DateFormat), userId);
        }

        public void Execute(IJobExecutionContext context)
        {
            Log.Debug(String.Format("Training Email Job! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group));
            try
            {
                JobDataMap dataMap = context.JobDetail.JobDataMap;
                int taskId = (Int32)dataMap[TrainingId];
                int userId = (Int32)dataMap[UserId];
                DateTime start = (DateTime)dataMap[StartDate];
                DateTime end = (DateTime)dataMap[EndDate];
                string trainingType = (string)dataMap[TrainingType];
                NotificationService ntfService = new NotificationService();
                ntfService.SendTrainingEmailNotification(taskId, userId, trainingType,start,end);
                Log.Info(String.Format("Training Email Job execution completed. Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group));
            }
            catch (Exception ex)
            {
                Log.Error(String.Format("Training Email Job execution failed! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group), ex);
            }
        }
    }
}