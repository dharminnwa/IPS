using IPS.Business;
using log4net;
using Quartz;
using System;

namespace IPSScheduler.Jobs
{
    public class StageResultJob : IJob
    {
        private static readonly ILog Log = LogManager.GetLogger("StageResultJob");
        private static string DateFormat = "yyMMddHHmm";

        public static string ParamStage = "stageId";
        public static string ParamParticipantUserId = "participantUserId";
        public static string ParamParticipantId = "participantId";

        public static string generateJobKey(int stageId,int participantId, DateTime stageEndTime)
        {
            return String.Format("{0}_{1}_{2}", stageId, participantId, stageEndTime.ToString(DateFormat));
        }

        public void Execute(IJobExecutionContext context)
        {
            Log.Debug(String.Format("Stage Result Job! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group));
            try
            {
                JobDataMap dataMap = context.JobDetail.JobDataMap;
                int stageId = (Int32)dataMap[ParamStage];
                int participantUserId = (Int32)dataMap[ParamParticipantUserId];
                int participantId = (Int32)dataMap[ParamParticipantId];
                NotificationService ntfService = new NotificationService();
                ntfService.SendParticipantStageResultNotification(participantUserId, stageId, null,participantId);

                Log.Info(String.Format("Stage Result Job! execution completed. Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group));
            }
            catch (Exception ex)
            {
                Log.Error(String.Format("Stage Result Job! execution failed! Job key: {0}; {1}", context.JobDetail.Key.Name, context.JobDetail.Key.Group), ex);
            }
        }
    }
}