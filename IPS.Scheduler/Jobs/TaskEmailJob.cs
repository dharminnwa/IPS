using IPS.Business;
using log4net;
using Quartz;
using System;

namespace IPSScheduler.Jobs
{
    public class TaskEmailJob : IJob
    {
        private static readonly ILog Log = LogManager.GetLogger("StartTaskEmailJob");
        private static string DateFormat = "yyMMddHHmm";

        public static string ParamStage = "stageId";

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
            Log.Debug(String.Format("Start Task Email  Job! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group));
            try
            {
                JobDataMap dataMap = context.JobDetail.JobDataMap;
                int taskId = (Int32)dataMap[ParamStage];
                NotificationService ntfService = new NotificationService();
                ntfService.SendTaskEmailNotification(taskId);
                Log.Info(String.Format("Task execution completed. Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group));
            }
            catch (Exception ex)
            {
                Log.Error(String.Format("Task execution failed! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group), ex);
            }
        }
    }

}