using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IPSScheduler.Jobs
{
    public class JobsReloader : IJob
    {
        public const String ShedulerInstanceParam = "scheduler";

        public void Execute(IJobExecutionContext context)
        {
            JobDataMap dataMap = context.JobDetail.JobDataMap;
            JobScheduler scheduler = (JobScheduler)dataMap[ShedulerInstanceParam];
            scheduler.ReloadJobs();
        }
    }
}