using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.Business.Utils;
using IPS.BusinessModels.TrainingModels;
using IPS.Data;
using IPSScheduler.Jobs;
using log4net;
using Quartz;
using Quartz.Impl;
using Quartz.Impl.Matchers;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace IPSScheduler
{
    public class JobScheduler
    {
        private IScheduler scheduler;

        public const string AlarmsGroup = "Alarms";
        public const string StartStageGroup = "StartStageGroup";
        public const string SystemGroup = "System";
        public const string TaskEmailGroup = "TaskEmail";
        public const string TaskEmailRecurrenceGroup = "TaskEmailRecurrence";
        public const string TaskSMSGroup = "TaskSMS";
        public const string TaskSMSRecurrenceGroup = "TaskSMSRecurrence";

        public const string PersonalTrainingEmailGroup = "PersonalTrainingEmail";
        public const string PersonalTrainingEmailRecurrenceGroup = "PersonalTrainingEmailRecurrence";
        public const string PersonalTrainingSMSGroup = "PersonalTrainingSMS";
        public const string PersonalTrainingSMSRecurrenceGroup = "PersonalTrainingSMSRecurrence";


        public const string ProfileTrainingEmailGroup = "ProfileTrainingEmail";
        public const string ProfileTrainingEmailRecurrenceGroup = "ProfileTrainingEmailRecurrence";
        public const string ProfileTrainingSMSGroup = "ProfileTrainingSMS";
        public const string ProfileTrainingSMSRecurrenceGroup = "ProfileTrainingSMSRecurrence";

        public const string StageResultGroup = "StageResultGroup";
        private static readonly ILog Log = LogManager.GetLogger("JobScheduler");

        public void Start()
        {
            if (Log.IsDebugEnabled)
            {
                Log.Debug("Scheduler Starting...");
            }

            scheduler = StdSchedulerFactory.GetDefaultScheduler();
            scheduler.Start();

            ReloadJobs();

            IJobDetail job = JobBuilder.Create<JobsReloader>().WithIdentity(SystemGroup, SystemGroup).Build();
            job.JobDataMap.Put(JobsReloader.ShedulerInstanceParam, this);
            int interval = Int32.Parse(ConfigurationManager.AppSettings["JobsReloadingIntervalMinutes"]);

            ITrigger trigger = TriggerBuilder.Create()
                .WithDailyTimeIntervalSchedule
                  (s =>
                     s.WithIntervalInMinutes(interval)
                    .OnEveryDay()
                    .StartingDailyAt(TimeOfDay.HourAndMinuteOfDay(0, 0))
                  )
                .Build();

            scheduler.ScheduleJob(job, trigger);
            if (Log.IsInfoEnabled)
            {
                Log.Info("Scheduler Started");
            }
        }

        public void Stop()
        {
            scheduler.Shutdown(true);
            if (Log.IsInfoEnabled)
            {
                Log.Info("Scheduler Stoped");
            }
        }

        public void ReloadJobs()
        {
            if (Log.IsDebugEnabled)
            {
                Log.Debug("Scheduler Jobs Reload Starting...");
            }

            ReloadAlarms();
            ReloadStartStageJobs();
            ReloadTaskEmailJobs();
            ReloadRecurrenceTaskEmailJobs();
            //ReloadTaskSMSJobs();
            //ReloadRecurrenceTaskSMSJobs();
            ReloadPersonalTrainingEmailJobs();
            ReloadPersonalTrainingRecurrenceEmailJobs();
            ReloadProfileTrainingEmailJobs();
            ReloadProfileTrainingRecurrenceEmailJobs();
            ReloadStageResultJobs();
            if (Log.IsDebugEnabled)
            {
                Log.Debug("Scheduler Jobs Reload Completed");
            }
        }

        private void ReloadStartStageJobs()
        {
            var loadedJobsDefinition = GetLoadedStartStageJobsDefinition();

            if (loadedJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of scheduled stages in the database is empty.");
                    return;
                }
            }

            var scheduledJobKeys = GetJobKeysByGroup(StartStageGroup);
            var loadedJobKeys = new HashSet<JobKey>(loadedJobsDefinition.Keys);
            // remove alarm jobs that are not scheduled anymore (canceled)
            foreach (var key in scheduledJobKeys)
            {
                if (!loadedJobKeys.Contains(key))
                {
                    scheduler.DeleteJob(key);
                }
            }
            // add alarm jobs that have not been scheduled yet
            foreach (var key in loadedJobKeys)
            {
                if (!scheduledJobKeys.Contains(key))
                {
                    IJobDetail job = JobBuilder.Create<StartStageJob>().WithIdentity(key.Name, key.Group).Build();
                    job.JobDataMap.Put(StartStageJob.ParamStage, loadedJobsDefinition[key].Id);
                    DateTime? triggerDate = loadedJobsDefinition[key].EvaluationStartDate;
                    if (!triggerDate.HasValue)
                    {
                        if (loadedJobsDefinition[key].EvaluationStartDate == null)
                        {
                            if (loadedJobsDefinition[key].EndDateTime.AddDays(-5) > loadedJobsDefinition[key].StartDateTime)
                            {
                                loadedJobsDefinition[key].EvaluationStartDate = loadedJobsDefinition[key].EndDateTime.AddDays(-5);
                            }
                            else
                            {
                                loadedJobsDefinition[key].EvaluationStartDate = loadedJobsDefinition[key].StartDateTime;
                            }
                        }
                    }
                    if (triggerDate.HasValue)
                    {
                        ITrigger trigger = TriggerBuilder.Create()
                        .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                        .Build();

                        scheduler.ScheduleJob(job, trigger);
                        Log.Debug(String.Format("Scheduled new Start Stage Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                    }
                }
            }
        }

        //Task
        private void ReloadTaskEmailJobs()
        {
            var loadedJobsDefinition = GetLoadedTaskEmailJobsDefinition();

            if (loadedJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of scheduled task email in the database is empty.");
                    return;
                }
            }

            var scheduledJobKeys = GetJobKeysByGroup(TaskEmailGroup);
            if (loadedJobsDefinition.Count() > 0)
            {
                var loadedJobKeys = new HashSet<JobKey>(loadedJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledJobKeys)
                {
                    if (!loadedJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedJobKeys)
                {
                    if (!scheduledJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TaskEmailJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TaskEmailJob.ParamStage, loadedJobsDefinition[key].Id);
                        DateTime? triggerDate = loadedJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled new Task Email Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }

        }
        private void ReloadRecurrenceTaskEmailJobs()
        {
            var loadedRecurrenceJobsDefinition = GetLoadedRecurrenceTaskEmailJobsDefinition();

            if (loadedRecurrenceJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of Recurrence scheduled task email in the database is empty.");
                    return;
                }
            }

            //RecurrenceEmailTask
            var scheduledRecurrenceJobKeys = GetJobKeysByGroup(TaskEmailRecurrenceGroup);
            if (loadedRecurrenceJobsDefinition.Count() > 0)
            {
                var loadedRecurrenceJobKeys = new HashSet<JobKey>(loadedRecurrenceJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledRecurrenceJobKeys)
                {
                    if (!loadedRecurrenceJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedRecurrenceJobKeys)
                {
                    if (!loadedRecurrenceJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TaskEmailJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TaskEmailJob.ParamStage, loadedRecurrenceJobsDefinition[key].Id);
                        DateTime? triggerDate = loadedRecurrenceJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled Recurrence scheduled task Email Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }
            //RecurrenceEmailTask

        }
        private void ReloadTaskSMSJobs()
        {
            var loadedJobsDefinition = GetLoadedTaskSMSJobsDefinition();

            if (loadedJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of scheduled task email in the database is empty.");
                    return;
                }
            }

            var scheduledJobKeys = GetJobKeysByGroup(TaskSMSGroup);
            if (loadedJobsDefinition.Count() > 0)
            {
                var loadedJobKeys = new HashSet<JobKey>(loadedJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledJobKeys)
                {
                    if (!loadedJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedJobKeys)
                {
                    if (!scheduledJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TaskSMSJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TaskSMSJob.ParamStage, loadedJobsDefinition[key].Id);
                        DateTime? triggerDate = loadedJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled new Task Email Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }

        }
        private void ReloadRecurrenceTaskSMSJobs()
        {
            var loadedRecurrenceJobsDefinition = GetLoadedRecurrenceTaskSMSJobsDefinition();

            if (loadedRecurrenceJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of Recurrence scheduled task email in the database is empty.");
                    return;
                }
            }

            //RecurrenceEmailTask
            var scheduledRecurrenceJobKeys = GetJobKeysByGroup(TaskSMSRecurrenceGroup);
            if (loadedRecurrenceJobsDefinition.Count() > 0)
            {
                var loadedRecurrenceJobKeys = new HashSet<JobKey>(loadedRecurrenceJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledRecurrenceJobKeys)
                {
                    if (!loadedRecurrenceJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedRecurrenceJobKeys)
                {
                    if (!loadedRecurrenceJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TaskSMSJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TaskSMSJob.ParamStage, loadedRecurrenceJobsDefinition[key].Id);
                        DateTime? triggerDate = loadedRecurrenceJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled Recurrence scheduled task Email Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }
            //RecurrenceEmailTask

        }

        //PersonalTraining
        private void ReloadPersonalTrainingEmailJobs()
        {
            var loadedJobsDefinition = GetLoadedPersonalTrainingEmailJobsDefinition();

            if (loadedJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of scheduled Personal Training Email in the database is empty.");
                    return;
                }
            }

            var scheduledJobKeys = GetJobKeysByGroup(PersonalTrainingEmailGroup);
            if (loadedJobsDefinition.Count() > 0)
            {
                var loadedJobKeys = new HashSet<JobKey>(loadedJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledJobKeys)
                {
                    if (!loadedJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedJobKeys)
                {
                    if (!scheduledJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TrainingEmailJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TrainingEmailJob.TrainingId, loadedJobsDefinition[key].Id);
                        job.JobDataMap.Put(TrainingEmailJob.UserId, loadedJobsDefinition[key].UserId);
                        double remindBefore = (Double)((loadedJobsDefinition[key].EmailBefore == null) ? -60 : loadedJobsDefinition[key].EmailBefore);
                        job.JobDataMap.Put(TrainingEmailJob.StartDate, loadedJobsDefinition[key].StartDate.Value.AddMinutes((remindBefore * -1)));
                        job.JobDataMap.Put(TrainingEmailJob.EndDate, loadedJobsDefinition[key].EndDate);
                        job.JobDataMap.Put(TrainingEmailJob.TrainingType, "Personal");
                        DateTime? triggerDate = loadedJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled new Personal Training Email Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }

        }
        private void ReloadPersonalTrainingRecurrenceEmailJobs()
        {
            var loadedRecurrenceJobsDefinition = GetLoadedPersonalTrainingRecurrenceEmailJobsDefinition();

            if (loadedRecurrenceJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of Personal Training Recurrence email in the database is empty.");
                    return;
                }
            }

            //RecurrenceEmailTask
            var scheduledRecurrenceJobKeys = GetJobKeysByGroup(TaskSMSRecurrenceGroup);
            if (loadedRecurrenceJobsDefinition.Count() > 0)
            {
                var loadedRecurrenceJobKeys = new HashSet<JobKey>(loadedRecurrenceJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledRecurrenceJobKeys)
                {
                    if (!loadedRecurrenceJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedRecurrenceJobKeys)
                {
                    if (!scheduledRecurrenceJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TrainingEmailJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TrainingEmailJob.TrainingId, loadedRecurrenceJobsDefinition[key].Id);
                        job.JobDataMap.Put(TrainingEmailJob.UserId, loadedRecurrenceJobsDefinition[key].UserId);
                        job.JobDataMap.Put(TrainingEmailJob.TrainingType, "Personal");
                        double remindBefore = (Double)((loadedRecurrenceJobsDefinition[key].EmailBefore == null) ? -60 : loadedRecurrenceJobsDefinition[key].EmailBefore);
                        job.JobDataMap.Put(TrainingEmailJob.StartDate, loadedRecurrenceJobsDefinition[key].StartDate.Value.AddMinutes((remindBefore * -1)));
                        job.JobDataMap.Put(TrainingEmailJob.EndDate, loadedRecurrenceJobsDefinition[key].EndDate);

                        DateTime? triggerDate = loadedRecurrenceJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled Recurrence scheduled task Email Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }
            //RecurrenceEmailTask

        }
        private void ReloadPersonalTrainingSMSJobs()
        {
            var loadedJobsDefinition = GetLoadedPersonalTrainingSMSJobsDefinition();

            if (loadedJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of scheduled Personal Training SMS in the database is empty.");
                    return;
                }
            }

            var scheduledJobKeys = GetJobKeysByGroup(PersonalTrainingSMSGroup);
            if (loadedJobsDefinition.Count() > 0)
            {
                var loadedJobKeys = new HashSet<JobKey>(loadedJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledJobKeys)
                {
                    if (!loadedJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedJobKeys)
                {
                    if (!scheduledJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TrainingSMSJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TrainingSMSJob.TrainingId, loadedJobsDefinition[key].Id);
                        job.JobDataMap.Put(TrainingSMSJob.UserId, loadedJobsDefinition[key].UserId);
                        job.JobDataMap.Put(TrainingSMSJob.TrainingType, "Personal");
                        DateTime? triggerDate = loadedJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled new Personal Training SMS Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }

        }
        private void ReloadPersonalTrainingRecurrenceSMSJobs()
        {
            var loadedRecurrenceJobsDefinition = GetLoadedPersonalTrainingRecurrenceSMSJobsDefinition();

            if (loadedRecurrenceJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of Personal Training Recurrence SMS in the database is empty.");
                    return;
                }
            }

            //RecurrenceEmailTask
            var scheduledRecurrenceJobKeys = GetJobKeysByGroup(PersonalTrainingSMSRecurrenceGroup);
            if (loadedRecurrenceJobsDefinition.Count() > 0)
            {
                var loadedRecurrenceJobKeys = new HashSet<JobKey>(loadedRecurrenceJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledRecurrenceJobKeys)
                {
                    if (!loadedRecurrenceJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedRecurrenceJobKeys)
                {
                    if (!loadedRecurrenceJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TrainingSMSJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TrainingSMSJob.TrainingId, loadedRecurrenceJobsDefinition[key].Id);
                        job.JobDataMap.Put(TrainingSMSJob.UserId, loadedRecurrenceJobsDefinition[key].UserId);
                        job.JobDataMap.Put(TrainingSMSJob.TrainingType, "Personal");
                        DateTime? triggerDate = loadedRecurrenceJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled Recurrence scheduled task SMS Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }
            //RecurrenceEmailTask

        }


        //ProfileTraining
        private void ReloadProfileTrainingEmailJobs()
        {
            var loadedJobsDefinition = GetLoadedProfileTrainingEmailJobsDefinition();

            if (loadedJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of scheduled Profile Training Email in the database is empty.");
                    return;
                }
            }

            var scheduledJobKeys = GetJobKeysByGroup(ProfileTrainingEmailGroup);
            if (loadedJobsDefinition.Count() > 0)
            {
                var loadedJobKeys = new HashSet<JobKey>(loadedJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledJobKeys)
                {
                    if (!loadedJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedJobKeys)
                {
                    if (!scheduledJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TrainingEmailJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TrainingEmailJob.TrainingId, loadedJobsDefinition[key].Id);
                        job.JobDataMap.Put(TrainingEmailJob.UserId, loadedJobsDefinition[key].UserId);
                        double remindBefore = (Double)((loadedJobsDefinition[key].EmailBefore == null) ? -60 : loadedJobsDefinition[key].EmailBefore);
                        job.JobDataMap.Put(TrainingEmailJob.StartDate, loadedJobsDefinition[key].StartDate.Value.AddMinutes((remindBefore * -1)));
                        job.JobDataMap.Put(TrainingEmailJob.EndDate, loadedJobsDefinition[key].EndDate);
                        job.JobDataMap.Put(TrainingEmailJob.TrainingType, "Profile");
                        DateTime? triggerDate = loadedJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled new Profile Training Email Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }

        }
        private void ReloadProfileTrainingRecurrenceEmailJobs()
        {
            var loadedRecurrenceJobsDefinition = GetLoadedProfileTrainingRecurrenceEmailJobsDefinition();

            if (loadedRecurrenceJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of Profile Training Recurrence email in the database is empty.");
                    return;
                }
            }

            //RecurrenceEmailTask
            var scheduledRecurrenceJobKeys = GetJobKeysByGroup(ProfileTrainingEmailRecurrenceGroup);
            if (loadedRecurrenceJobsDefinition.Count() > 0)
            {
                var loadedRecurrenceJobKeys = new HashSet<JobKey>(loadedRecurrenceJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledRecurrenceJobKeys)
                {
                    if (!loadedRecurrenceJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedRecurrenceJobKeys)
                {
                    if (!scheduledRecurrenceJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TrainingEmailJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TrainingEmailJob.TrainingId, loadedRecurrenceJobsDefinition[key].Id);
                        job.JobDataMap.Put(TrainingEmailJob.UserId, loadedRecurrenceJobsDefinition[key].UserId);
                        double remindBefore = (Double)((loadedRecurrenceJobsDefinition[key].EmailBefore == null) ? -60 : loadedRecurrenceJobsDefinition[key].EmailBefore);
                        job.JobDataMap.Put(TrainingEmailJob.StartDate, loadedRecurrenceJobsDefinition[key].StartDate.Value.AddMinutes((remindBefore * -1)));
                        job.JobDataMap.Put(TrainingEmailJob.EndDate, loadedRecurrenceJobsDefinition[key].EndDate);
                        job.JobDataMap.Put(TrainingEmailJob.TrainingType, "Profile");

                        DateTime? triggerDate = loadedRecurrenceJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled Recurrence scheduled task Email Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }
            //RecurrenceEmailTask

        }
        private void ReloadProfileTrainingSMSJobs()
        {
            var loadedJobsDefinition = GetLoadedProfileTrainingSMSJobsDefinition();

            if (loadedJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of scheduled Profile Training SMS in the database is empty.");
                    return;
                }
            }

            var scheduledJobKeys = GetJobKeysByGroup(ProfileTrainingSMSGroup);
            if (loadedJobsDefinition.Count() > 0)
            {
                var loadedJobKeys = new HashSet<JobKey>(loadedJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledJobKeys)
                {
                    if (!loadedJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedJobKeys)
                {
                    if (!scheduledJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TrainingSMSJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TrainingSMSJob.TrainingId, loadedJobsDefinition[key].Id);
                        job.JobDataMap.Put(TrainingSMSJob.UserId, loadedJobsDefinition[key].UserId);
                        job.JobDataMap.Put(TrainingSMSJob.TrainingType, "Profile");

                        DateTime? triggerDate = loadedJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled new Profile Training SMS Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }

        }
        private void ReloadProfileTrainingRecurrenceSMSJobs()
        {
            var loadedRecurrenceJobsDefinition = GetLoadedProfileTrainingRecurrenceSMSJobsDefinition();

            if (loadedRecurrenceJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of Profile Training Recurrence SMS in the database is empty.");
                    return;
                }
            }

            //RecurrenceEmailTask
            var scheduledRecurrenceJobKeys = GetJobKeysByGroup(ProfileTrainingSMSRecurrenceGroup);
            if (loadedRecurrenceJobsDefinition.Count() > 0)
            {
                var loadedRecurrenceJobKeys = new HashSet<JobKey>(loadedRecurrenceJobsDefinition.Keys);
                // remove alarm jobs that are not scheduled anymore (canceled)
                foreach (var key in scheduledRecurrenceJobKeys)
                {
                    if (!loadedRecurrenceJobKeys.Contains(key))
                    {
                        scheduler.DeleteJob(key);
                    }
                }
                // add alarm jobs that have not been scheduled yet
                foreach (var key in loadedRecurrenceJobKeys)
                {
                    if (!loadedRecurrenceJobKeys.Contains(key))
                    {
                        IJobDetail job = JobBuilder.Create<TrainingSMSJob>().WithIdentity(key.Name, key.Group).Build();
                        job.JobDataMap.Put(TrainingSMSJob.TrainingId, loadedRecurrenceJobsDefinition[key].Id);
                        job.JobDataMap.Put(TrainingSMSJob.UserId, loadedRecurrenceJobsDefinition[key].UserId);
                        job.JobDataMap.Put(TrainingSMSJob.TrainingType, "Profile");
                        DateTime? triggerDate = loadedRecurrenceJobsDefinition[key].StartDate;
                        if (triggerDate.HasValue)
                        {
                            ITrigger trigger = TriggerBuilder.Create()
                            .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                            .Build();

                            scheduler.ScheduleJob(job, trigger);
                            Log.Debug(String.Format("Scheduled Recurrence scheduled task SMS Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                        }
                    }
                }
            }
            //RecurrenceEmailTask

        }

        private void ReloadAlarms()
        {
            var loadedJobsDefinition = GetLoadedAlarmsJobsDefinition();
            if (loadedJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of scheduled alarms in the database is empty.");
                    return;
                }
            }
            var scheduledJobKeys = GetJobKeysByGroup(AlarmsGroup);
            var loadedJobKeys = new HashSet<JobKey>(loadedJobsDefinition.Keys);
            // remove alarm jobs that are not scheduled anymore (canceled)
            foreach (var key in scheduledJobKeys)
            {
                if (!loadedJobKeys.Contains(key))
                {
                    scheduler.DeleteJob(key);
                }
            }
            // add alarm jobs that have not been scheduled yet
            foreach (var key in loadedJobKeys)
            {
                if (!scheduledJobKeys.Contains(key))
                {
                    IJobDetail job = JobBuilder.Create<AlarmJob>().WithIdentity(key.Name, key.Group).Build();
                    job.JobDataMap.Put(AlarmJob.ParamStage, loadedJobsDefinition[key].Id);
                    DateTime? triggerDate = null;
                    if (key.Name.Contains(AlarmJob.AlarmGreen))
                    {
                        job.JobDataMap.Put(AlarmJob.ParamAlarmType, AlarmJob.AlarmGreen);
                        triggerDate = loadedJobsDefinition[key].GreenAlarmTime;
                    }
                    else if (key.Name.Contains(AlarmJob.AlarmYellow))
                    {
                        job.JobDataMap.Put(AlarmJob.ParamAlarmType, AlarmJob.AlarmYellow);
                        triggerDate = loadedJobsDefinition[key].YellowAlarmTime;
                    }
                    else if (key.Name.Contains(AlarmJob.AlarmRed))
                    {
                        job.JobDataMap.Put(AlarmJob.ParamAlarmType, AlarmJob.AlarmRed);
                        triggerDate = loadedJobsDefinition[key].RedAlarmTime;
                    }

                    if (triggerDate.HasValue)
                    {
                        ITrigger trigger = TriggerBuilder.Create()
                        .StartAt(DateBuilder.DateOf(triggerDate.Value.Hour, triggerDate.Value.Minute, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                        .Build();

                        scheduler.ScheduleJob(job, trigger);
                        Log.Debug(String.Format("Scheduled new Alarm Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                    }
                }
            }

        }

        private Quartz.Collection.ISet<JobKey> GetJobKeysByGroup(string groupName)
        {
            var groupMatcher = GroupMatcher<JobKey>.GroupContains(groupName);
            return scheduler.GetJobKeys(groupMatcher);
        }

        private Dictionary<JobKey, Stage> GetLoadedAlarmsJobsDefinition()
        {
            List<Stage> stages = LoadStagesWithAlarms();
            if (stages == null)
                return null;
            if (stages.Count > 0)
            {
                Dictionary<JobKey, Stage> alarmJobKeys = new Dictionary<JobKey, Stage>();
                foreach (var s in stages)
                {
                    DateTime date = DateTime.Now;
                    if (s.GreenAlarmTime.HasValue && s.GreenAlarmTime > date)
                    {
                        JobKey key = new JobKey(AlarmJob.generateJobKey(s.Id, AlarmJob.AlarmGreen, (DateTime)s.GreenAlarmTime), AlarmsGroup);
                        alarmJobKeys.Add(key, s);
                    }
                    if (s.YellowAlarmTime.HasValue && s.YellowAlarmTime > date)
                    {
                        JobKey key = new JobKey(AlarmJob.generateJobKey(s.Id, AlarmJob.AlarmYellow, (DateTime)s.YellowAlarmTime), AlarmsGroup);
                        alarmJobKeys.Add(key, s);
                    }
                    if (s.RedAlarmTime.HasValue && s.RedAlarmTime > date)
                    {
                        JobKey key = new JobKey(AlarmJob.generateJobKey(s.Id, AlarmJob.AlarmRed, (DateTime)s.RedAlarmTime), AlarmsGroup);
                        alarmJobKeys.Add(key, s);
                    }
                }
                return alarmJobKeys;
            }
            return new Dictionary<JobKey, Stage>();
        }

        private List<Stage> LoadStagesWithAlarms()
        {
            try
            {
                StagesService serice = new StagesService();
                IQueryable<Stage> stages = serice.Get();
                DateTime TodayStartDate = DateTime.Today;
                DateTime TodayEndDate = DateTime.Today.AddDays(1);
                return stages.Where(s => ((s.GreenAlarmTime >= TodayStartDate && s.GreenAlarmTime <= TodayEndDate) || (s.YellowAlarmTime >= TodayStartDate && s.YellowAlarmTime <= TodayEndDate) || (s.RedAlarmTime >= TodayStartDate && s.RedAlarmTime <= TodayEndDate)) && s.IsPaused != true && s.IsStopped != true).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading alarms from database failed!", ex);
            }
            return null;
        }

        private Dictionary<JobKey, Stage> GetLoadedStartStageJobsDefinition()
        {
            List<Stage> stages = LoadFutureStages();

            if (stages == null)
            {
                return null;
            }

            if (stages.Count > 0)
            {
                Dictionary<JobKey, Stage> startStageJobKeys = new Dictionary<JobKey, Stage>();

                foreach (var s in stages)
                {
                    if (s.EvaluationStartDate == null)
                    {
                        if (s.EndDateTime.AddDays(-5) > s.StartDateTime)
                        {
                            s.EvaluationStartDate = s.EndDateTime.AddDays(-5);
                        }
                        else
                        {
                            s.EvaluationStartDate = s.StartDateTime;
                        }
                    }
                    if (s.EvaluationStartDate >= s.StartDateTime)
                    {
                        JobKey key = new JobKey(StartStageJob.generateJobKey(s.Id, s.StartDateTime), StartStageGroup);
                        startStageJobKeys.Add(key, s);
                    }
                }

                return startStageJobKeys;
            }

            return new Dictionary<JobKey, Stage>();
        }

        private List<Stage> LoadFutureStages()
        {
            try
            {
                StagesService serice = new StagesService();
                IQueryable<Stage> stages = serice.Get();
                DateTime date = DateTime.Now;
                DateTime tomorrow = DateTime.Today.AddDays(1);
                return stages.Where(s => (s.StartDateTime > date) && s.StartDateTime < tomorrow && s.IsPaused != true && s.IsStopped != true).OrderBy(s => s.StartDateTime).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }


        //Task
        private Dictionary<JobKey, IPS.Data.Task> GetLoadedTaskEmailJobsDefinition()
        {
            List<Task> tasks = LoadFutureTaskForEmail();
            Dictionary<JobKey, IPS.Data.Task> taskEmailJobs = new Dictionary<JobKey, IPS.Data.Task>();

            if (tasks == null)
            {
                return null;
            }

            if (tasks.Count > 0)
            {
                foreach (var t in tasks)
                {
                    //double remindBefore = (Double)((t.EmailBefore == null) ? 0 : t.EmailBefore);
                    //t.StartDate = t.StartDate.Value.AddMinutes(remindBefore);
                    //if (t.StartDate > now && t.StartDate< now.AddMinutes(5))
                    //{
                    JobKey key = new JobKey(TaskEmailJob.generateJobKey(t.Id, (DateTime)t.StartDate), TaskEmailGroup);
                    taskEmailJobs.Add(key, t);
                    //}

                }

                return taskEmailJobs;
            }

            return taskEmailJobs;
        }
        private Dictionary<JobKey, IPS.Data.Task> GetLoadedRecurrenceTaskEmailJobsDefinition()
        {
            List<Task> recurrencetasks = LoadFutureRecurrenceTaskForEmail();
            Dictionary<JobKey, IPS.Data.Task> taskEmailJobs = new Dictionary<JobKey, IPS.Data.Task>();

            if (recurrencetasks == null)
            {
                return null;
            }

            if (recurrencetasks.Count > 0)
            {
                foreach (var t in recurrencetasks)
                {
                    JobKey key = new JobKey(TaskEmailJob.generateRecurrenceJobKey(t.Id, (DateTime)t.StartDate), TaskEmailRecurrenceGroup);
                    taskEmailJobs.Add(key, t);
                }
                return taskEmailJobs;
            }

            return taskEmailJobs;
        }
        private Dictionary<JobKey, IPS.Data.Task> GetLoadedTaskSMSJobsDefinition()
        {
            List<Task> tasks = LoadFutureTaskForSMS();
            Dictionary<JobKey, IPS.Data.Task> taskSMSJobs = new Dictionary<JobKey, IPS.Data.Task>();

            if (tasks == null)
            {
                return null;
            }

            if (tasks.Count > 0)
            {
                foreach (var t in tasks)
                {
                    JobKey key = new JobKey(TaskSMSJob.generateJobKey(t.Id, (DateTime)t.StartDate), TaskSMSGroup);
                    taskSMSJobs.Add(key, t);
                }

                return taskSMSJobs;
            }

            return taskSMSJobs;
        }
        private Dictionary<JobKey, IPS.Data.Task> GetLoadedRecurrenceTaskSMSJobsDefinition()
        {
            List<Task> recurrencetasks = LoadFutureRecurrenceTaskForSMS();
            Dictionary<JobKey, IPS.Data.Task> taskSMSJobs = new Dictionary<JobKey, IPS.Data.Task>();

            if (recurrencetasks == null)
            {
                return null;
            }

            if (recurrencetasks.Count > 0)
            {
                foreach (var t in recurrencetasks)
                {
                    JobKey key = new JobKey(TaskEmailJob.generateRecurrenceJobKey(t.Id, (DateTime)t.StartDate), TaskSMSRecurrenceGroup);
                    taskSMSJobs.Add(key, t);
                }
                return taskSMSJobs;
            }

            return taskSMSJobs;
        }

        //PersonalTraining
        private Dictionary<JobKey, Training> GetLoadedPersonalTrainingEmailJobsDefinition()
        {
            List<Training> trainings = LoadFuturePersonalTrainingForEmail();
            Dictionary<JobKey, Training> taskEmailJobs = new Dictionary<JobKey, Training>();

            if (trainings == null)
            {
                return null;
            }

            if (trainings.Count > 0)
            {
                foreach (var t in trainings)
                {
                    //double remindBefore = (Double)((t.EmailBefore == null) ? 0 : t.EmailBefore);
                    //t.StartDate = t.StartDate.Value.AddMinutes(remindBefore);
                    //if (t.StartDate > now && t.StartDate< now.AddMinutes(5))
                    //{
                    JobKey key = new JobKey(TrainingEmailJob.generateJobKey(t.Id, (DateTime)t.StartDate), PersonalTrainingEmailGroup);
                    taskEmailJobs.Add(key, t);
                    //}

                }

                return taskEmailJobs;
            }

            return taskEmailJobs;
        }
        private Dictionary<JobKey, Training> GetLoadedPersonalTrainingRecurrenceEmailJobsDefinition()
        {
            List<Training> personalRecurrenceTrainings = LoadFuturePersonalRecurrenceTrainingForEmail();
            Dictionary<JobKey, Training> personalRecurrenceTrainingEmailJobs = new Dictionary<JobKey, Training>();

            if (personalRecurrenceTrainings == null)
            {
                return null;
            }

            if (personalRecurrenceTrainings.Count > 0)
            {
                foreach (var t in personalRecurrenceTrainings)
                {
                    JobKey key = new JobKey(TrainingEmailJob.generateRecurrenceJobKey(t.Id, (DateTime)t.StartDate, t.UserId), PersonalTrainingEmailRecurrenceGroup);
                    personalRecurrenceTrainingEmailJobs.Add(key, t);
                }
                return personalRecurrenceTrainingEmailJobs;
            }

            return personalRecurrenceTrainingEmailJobs;
        }
        private Dictionary<JobKey, Training> GetLoadedPersonalTrainingSMSJobsDefinition()
        {
            List<Training> trainings = LoadFuturePersonalTrainingForSMS();
            Dictionary<JobKey, Training> trainingSMSJobs = new Dictionary<JobKey, Training>();

            if (trainings == null)
            {
                return null;
            }

            if (trainings.Count > 0)
            {
                foreach (var t in trainings)
                {
                    //double remindBefore = (Double)((t.EmailBefore == null) ? 0 : t.EmailBefore);
                    //t.StartDate = t.StartDate.Value.AddMinutes(remindBefore);
                    //if (t.StartDate > now && t.StartDate< now.AddMinutes(5))
                    //{
                    JobKey key = new JobKey(TrainingSMSJob.generateJobKey(t.Id, (DateTime)t.StartDate), PersonalTrainingSMSGroup);
                    trainingSMSJobs.Add(key, t);
                    //}

                }

                return trainingSMSJobs;
            }

            return trainingSMSJobs;
        }
        private Dictionary<JobKey, Training> GetLoadedPersonalTrainingRecurrenceSMSJobsDefinition()
        {
            List<Training> personalRecurrenceTrainings = LoadFuturePersonalRecurrenceTrainingForSMS();
            Dictionary<JobKey, Training> personalRecurrenceTrainingSMSJobs = new Dictionary<JobKey, Training>();

            if (personalRecurrenceTrainings == null)
            {
                return null;
            }

            if (personalRecurrenceTrainings.Count > 0)
            {
                foreach (var t in personalRecurrenceTrainings)
                {
                    JobKey key = new JobKey(TrainingSMSJob.generateRecurrenceJobKey(t.Id, (DateTime)t.StartDate), PersonalTrainingEmailRecurrenceGroup);
                    personalRecurrenceTrainingSMSJobs.Add(key, t);
                }
                return personalRecurrenceTrainingSMSJobs;
            }

            return personalRecurrenceTrainingSMSJobs;
        }

        //ProfileTraining
        private Dictionary<JobKey, IpsTrainingModel> GetLoadedProfileTrainingEmailJobsDefinition()
        {
            List<IpsTrainingModel> trainings = LoadFutureProfileTrainingForEmail();
            Dictionary<JobKey, IpsTrainingModel> taskEmailJobs = new Dictionary<JobKey, IpsTrainingModel>();

            if (trainings == null)
            {
                return null;
            }

            if (trainings.Count > 0)
            {
                foreach (var t in trainings)
                {
                    //double remindBefore = (Double)((t.EmailBefore == null) ? 0 : t.EmailBefore);
                    //t.StartDate = t.StartDate.Value.AddMinutes(remindBefore);
                    //if (t.StartDate > now && t.StartDate< now.AddMinutes(5))
                    //{
                    JobKey key = new JobKey(TrainingEmailJob.generateJobKey(t.Id, (DateTime)t.StartDate), ProfileTrainingEmailGroup);
                    taskEmailJobs.Add(key, t);
                    //}

                }

                return taskEmailJobs;
            }

            return taskEmailJobs;
        }
        private Dictionary<JobKey, IpsTrainingModel> GetLoadedProfileTrainingRecurrenceEmailJobsDefinition()
        {
            List<IpsTrainingModel> profileRecurrenceTrainings = LoadFutureProfileRecurrenceTrainingForEmail();
            Dictionary<JobKey, IpsTrainingModel> profileRecurrenceTrainingEmailJobs = new Dictionary<JobKey, IpsTrainingModel>();

            if (profileRecurrenceTrainings == null)
            {
                return null;
            }

            if (profileRecurrenceTrainings.Count > 0)
            {
                foreach (var t in profileRecurrenceTrainings)
                {
                    JobKey key = new JobKey(TrainingEmailJob.generateRecurrenceJobKey(t.Id, (DateTime)t.StartDate, t.UserId), ProfileTrainingEmailRecurrenceGroup);
                    if (!profileRecurrenceTrainingEmailJobs.Any(x => x.Key.Name == key.Name))
                    {
                        profileRecurrenceTrainingEmailJobs.Add(key, t);
                    }
                }
                return profileRecurrenceTrainingEmailJobs;
            }

            return profileRecurrenceTrainingEmailJobs;
        }
        private Dictionary<JobKey, IpsTrainingModel> GetLoadedProfileTrainingSMSJobsDefinition()
        {
            List<IpsTrainingModel> trainings = LoadFutureProfileTrainingForSMS();
            Dictionary<JobKey, IpsTrainingModel> trainingSMSJobs = new Dictionary<JobKey, IpsTrainingModel>();

            if (trainings == null)
            {
                return null;
            }

            if (trainings.Count > 0)
            {
                foreach (var t in trainings)
                {
                    //double remindBefore = (Double)((t.EmailBefore == null) ? 0 : t.EmailBefore);
                    //t.StartDate = t.StartDate.Value.AddMinutes(remindBefore);
                    //if (t.StartDate > now && t.StartDate< now.AddMinutes(5))
                    //{
                    JobKey key = new JobKey(TrainingSMSJob.generateJobKey(t.Id, (DateTime)t.StartDate), ProfileTrainingSMSGroup);
                    trainingSMSJobs.Add(key, t);
                    //}

                }

                return trainingSMSJobs;
            }

            return trainingSMSJobs;
        }
        private Dictionary<JobKey, IpsTrainingModel> GetLoadedProfileTrainingRecurrenceSMSJobsDefinition()
        {
            List<IpsTrainingModel> profileRecurrenceTrainings = LoadFutureProfileRecurrenceTrainingForSMS();
            Dictionary<JobKey, IpsTrainingModel> profileRecurrenceTrainingSMSJobs = new Dictionary<JobKey, IpsTrainingModel>();

            if (profileRecurrenceTrainings == null)
            {
                return null;
            }

            if (profileRecurrenceTrainings.Count > 0)
            {
                foreach (var t in profileRecurrenceTrainings)
                {
                    JobKey key = new JobKey(TrainingSMSJob.generateRecurrenceJobKey(t.Id, (DateTime)t.StartDate), ProfileTrainingSMSRecurrenceGroup);
                    profileRecurrenceTrainingSMSJobs.Add(key, t);
                }
                return profileRecurrenceTrainingSMSJobs;
            }

            return profileRecurrenceTrainingSMSJobs;
        }

        //Task
        private List<Task> LoadFutureTaskForEmail()
        {
            try
            {
                TaskService serice = new TaskService();
                IQueryable<Task> task = serice.GetAllForEmailNotification();
                return task.OrderBy(s => s.StartDate).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }
        private List<Task> LoadFutureRecurrenceTaskForEmail()
        {
            try
            {
                TaskService serice = new TaskService();
                IQueryable<Task> task = serice.GetAllRecurrenceTasksForEmailNotification();
                return task.OrderBy(s => s.StartDate).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }
        private List<Task> LoadFutureTaskForSMS()
        {
            try
            {
                TaskService serice = new TaskService();
                IQueryable<Task> task = serice.GetAllForSMSNotification();
                return task.OrderBy(s => s.StartDate).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }
        private List<Task> LoadFutureRecurrenceTaskForSMS()
        {
            try
            {
                TaskService serice = new TaskService();
                IQueryable<Task> task = serice.GetAllRecurrenceTasksForSMSNotification();
                return task.OrderBy(s => s.StartDate).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }

        //PersonalTraining
        private List<Training> LoadFuturePersonalTrainingForEmail()
        {
            try
            {
                TrainingDiaryService serice = new TrainingDiaryService();
                List<Training> training = serice.GetAllPersonalTrainingsForEmail();
                return training.OrderBy(s => s.StartDate).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }
        private List<Training> LoadFuturePersonalRecurrenceTrainingForEmail()
        {
            try
            {
                TrainingDiaryService serice = new TrainingDiaryService();
                List<Training> training = serice.GetAllPersonalTrainingRecurrencesForEmail();
                return training.OrderBy(s => s.StartDate).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }
        private List<Training> LoadFuturePersonalTrainingForSMS()
        {
            try
            {
                TrainingDiaryService serice = new TrainingDiaryService();
                List<Training> training = serice.GetAllPersonalTrainingsForSMS();
                return training.OrderBy(s => s.StartDate).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }
        private List<Training> LoadFuturePersonalRecurrenceTrainingForSMS()
        {
            try
            {
                TrainingDiaryService serice = new TrainingDiaryService();
                List<Training> training = serice.GetAllPersonalTrainingRecurrencesForSMS();
                return training.OrderBy(s => s.StartDate).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }

        //ProfileTraining
        private List<IpsTrainingModel> LoadFutureProfileTrainingForEmail()
        {
            try
            {
                TrainingDiaryService serice = new TrainingDiaryService();
                List<IpsTrainingModel> training = serice.GetAllProfileTrainingsForEmail();
                return training.OrderBy(s => s.StartDate).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }
        private List<IpsTrainingModel> LoadFutureProfileRecurrenceTrainingForEmail()
        {
            try
            {
                TrainingDiaryService serice = new TrainingDiaryService();
                List<IpsTrainingModel> training = serice.GetAllProfileTrainingRecurrenceForEmail();
                return training.OrderBy(s => s.StartDate).Distinct().ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }
        private List<IpsTrainingModel> LoadFutureProfileTrainingForSMS()
        {
            try
            {
                TrainingDiaryService serice = new TrainingDiaryService();
                List<IpsTrainingModel> training = serice.GetAllProfileTrainingsForSMS();
                return training.OrderBy(s => s.StartDate).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }
        private List<IpsTrainingModel> LoadFutureProfileRecurrenceTrainingForSMS()
        {
            try
            {
                TrainingDiaryService serice = new TrainingDiaryService();
                List<IpsTrainingModel> training = serice.GetAllProfileTrainingRecurrenceForSMS();
                return training.OrderBy(s => s.StartDate).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of future stages from database failed!", ex);
            }
            return null;
        }


        //StageResult
        private void ReloadStageResultJobs()
        {
            var loadedJobsDefinition = GetLoadedCompletedStageJobsDefinition();

            if (loadedJobsDefinition == null)
            {
                if (Log.IsInfoEnabled)
                {
                    Log.Info("List of scheduled stages in the database is empty.");
                    return;
                }
            }

            var scheduledJobKeys = GetJobKeysByGroup(StageResultGroup);
            var loadedJobKeys = new HashSet<JobKey>(loadedJobsDefinition.Keys);
            // remove alarm jobs that are not scheduled anymore (canceled)
            foreach (var key in scheduledJobKeys)
            {
                if (!loadedJobKeys.Contains(key))
                {
                    scheduler.DeleteJob(key);
                }
            }
            // add alarm jobs that have not been scheduled yet
            foreach (var key in loadedJobKeys)
            {
                if (!scheduledJobKeys.Contains(key))
                {
                    IJobDetail job = JobBuilder.Create<StageResultJob>().WithIdentity(key.Name, key.Group).Build();
                    job.JobDataMap.Put(StageResultJob.ParamStage, loadedJobsDefinition[key].StageId);
                    job.JobDataMap.Put(StageResultJob.ParamParticipantUserId, loadedJobsDefinition[key].ParticipantUserId);
                    job.JobDataMap.Put(StageResultJob.ParamParticipantId, loadedJobsDefinition[key].ParticipantId);
                    DateTime? triggerDate = loadedJobsDefinition[key].EndDateTime;
                    if (triggerDate.HasValue)
                    {
                        triggerDate = triggerDate.Value.AddDays(1);
                        ITrigger trigger = TriggerBuilder.Create()
                        .StartAt(DateBuilder.DateOf(8, 0, 0, triggerDate.Value.Day, triggerDate.Value.Month, triggerDate.Value.Year))
                        .Build();

                        scheduler.ScheduleJob(job, trigger);
                        Log.Debug(String.Format("Scheduled new Stage Result Job! Job key: {0}; {1} on {2}", key.Name, key.Group, triggerDate));
                    }
                }
            }
        }
        private Dictionary<JobKey, IpsStageResultNotification> GetLoadedCompletedStageJobsDefinition()
        {
            List<Stage> stages = LoadCompletedStages();

            if (stages == null)
            {
                return null;
            }

            if (stages.Count > 0)
            {
                Dictionary<JobKey, IpsStageResultNotification> completedStageJobKeys = new Dictionary<JobKey, IpsStageResultNotification>();

                foreach (var s in stages)
                {


                    StageGroupsService stageGroupsService = new StageGroupsService();
                    List<IpsEvaluationUser> participants = stageGroupsService.GetStageParticipants(s.StageGroupId);
                    foreach (IpsEvaluationUser participant in participants)
                    {
                        IpsStageResultNotification ipsStage = new IpsStageResultNotification()
                        {
                            StageId = s.Id,
                            EndDateTime = s.EndDateTime,
                            Name = s.Name,
                            StartDateTime = s.StartDateTime,
                            ManagerId = s.ManagerId,
                            ParticipantId = participant.ParticipantId,
                            ParticipantUserId = participant.UserId
                        };
                        JobKey key = new JobKey(StageResultJob.generateJobKey(s.Id, ipsStage.ParticipantId, s.EndDateTime), StageResultGroup);
                        completedStageJobKeys.Add(key, ipsStage);
                    }

                }

                return completedStageJobKeys;
            }

            return new Dictionary<JobKey, IpsStageResultNotification>();
        }
        private List<Stage> LoadCompletedStages()
        {
            List<Stage> result = new List<Stage>();
            try
            {

                StagesService serice = new StagesService();
                IQueryable<Stage> stages = serice.Get();
                DateTime YesterdayStartDate = DateTime.Today.AddDays(-1);
                DateTime YesterdayEndDate = DateTime.Today.AddMinutes(-1);
                result = stages
                    .Where(s => s.EndDateTime >= YesterdayStartDate && s.EndDateTime < YesterdayEndDate && s.Answers.Count > 0)
                    .OrderBy(s => s.EndDateTime).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Loading of completed stages from database failed!", ex);
            }
            return result;
        }


    }


}