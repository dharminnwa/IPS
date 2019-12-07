using IPS.Business;
using log4net;
using Quartz;
using System;

namespace IPSScheduler.Jobs
{
    public class StartStageJob : IJob
    {
        private static readonly ILog Log = LogManager.GetLogger("StartStageJob");
        private static string DateFormat = "yyMMddHHmm";

        public static string ParamStage = "stageId";

        public static string generateJobKey(int stageId, DateTime stageStartTime)
        {
            return String.Format("{0}_{1}", stageId, stageStartTime.ToString(DateFormat));
        }

        public void Execute(IJobExecutionContext context)
        {
            Log.Debug(String.Format("Start Stage Job! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group));
            try
            {
                JobDataMap dataMap = context.JobDetail.JobDataMap;
                int stageId = (Int32)dataMap[ParamStage];
                NotificationService ntfService = new NotificationService();
                ntfService.SendStartNewStageNotification(stageId, null, false /*true*/);
                Log.Info(String.Format("Start Stage execution completed. Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group));
            }
            catch (Exception ex)
            {
                Log.Error(String.Format("Start Stage execution failed! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group), ex);
            }
        }
    }
}