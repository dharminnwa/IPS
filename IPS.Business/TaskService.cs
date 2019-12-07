using IPS.Data;
using IPS.BusinessModels.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections;
using IPS.Business.Utils;
using IPS.BusinessModels.TaskModels;
using IPS.BusinessModels.SalesActivityModels;
using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.ProjectModel;
using IPS.BusinessModels.Enum;

namespace IPS.Business
{
    public class TaskService : BaseService, IPS.Business.ITaskService
    {
        public IQueryable<IPS.Data.TaskList> GetTasksListByUserKey(string userKey)
        {
            int id = _ipsDataContext.Users.Where(u => u.UserKey == userKey).FirstOrDefault().Id;
            List<int> taskListIdList = _ipsDataContext.TaskLists.Where(tl => tl.UserId == id).Select(tl => tl.Id).ToList();
            int taskListId;
            if (taskListIdList.Count == 0)
            {
                int categoryListId = GetCategoryListId(id);
                int priorityListId = GetPriorityListId(id);
                int statusListId = GetStatusListId(id);

                TaskList taskList = new TaskList();
                taskList.Name = "Tasks List";
                taskList.TaskCategoryListsId = categoryListId;
                taskList.TaskPriorityListId = priorityListId;
                taskList.TaskStatusListId = statusListId;
                taskList.UserId = id;

                _ipsDataContext.TaskLists.Add(taskList);
                _ipsDataContext.SaveChanges();
                taskListId = taskList.Id;
            }
            else
            {
                taskListId = taskListIdList[0];
            }
            IQueryable<IPS.Data.TaskList> result = _ipsDataContext.TaskLists
                .Include("Tasks.TrainingFeedbacks")
                .Where(t => t.Id == taskListId).AsNoTracking().AsQueryable();

            return result;
        }

        public TaskListModel GetTasksListItemByUserKey(string userKey)
        {
            TaskListModel result = new TaskListModel();
            int id = _ipsDataContext.Users.Where(u => u.UserKey == userKey).FirstOrDefault().Id;
            return _ipsDataContext.TaskLists.Where(tl => tl.UserId == id).Select(x => new TaskListModel
            {
                Id = x.Id,
                Name = x.Name,
                TaskCategoryListsId = x.TaskCategoryListsId,
                TaskPriorityListId = x.TaskPriorityListId,
                TaskStatusListId = x.TaskStatusListId,
            }).FirstOrDefault();
        }

        public IQueryable<IPS.Data.Task> GetTasksByUserKey(string userKey)
        {
            int id = _ipsDataContext.Users.Where(u => u.UserKey == userKey).FirstOrDefault().Id;
            return _ipsDataContext.Tasks.Include("TrainingFeedbacks").Where(t => t.CreatedById == id || t.AssignedToId == id).AsNoTracking().AsQueryable();
        }
        public List<IPS.Data.Task> GetTasksByUserId(int userId)
        {
            return _ipsDataContext.Tasks.Include("TrainingFeedbacks").Include("TaskCategoryListItem").Where(t => t.CreatedById == userId || t.AssignedToId == userId).AsNoTracking().ToList();
        }

        public List<IPS.Data.Task> GetTasksByUserIds(List<int> userIds)
        {
            return _ipsDataContext.Tasks.Include("TrainingFeedbacks").Include("TaskCategoryListItem").Where(t => userIds.Contains(t.CreatedById.HasValue ? t.CreatedById.Value : 0) || userIds.Contains(t.AssignedToId.HasValue ? t.AssignedToId.Value : 0)).AsNoTracking().ToList();
        }


        public IQueryable<IPS.Data.Task> GetTasksByListId(int taskListId)
        {
            return _ipsDataContext.Tasks.Where(t => t.TaskListId == taskListId).AsNoTracking().AsQueryable();
        }

        public IQueryable<IPS.Data.TaskList> GetTaskListById(int taskListId)
        {
            return _ipsDataContext.TaskLists.Where(t => t.Id == taskListId).AsNoTracking().AsQueryable();
        }

        public IQueryable<IPS.Data.Task> GetTaskById(int taskId)
        {
            return _ipsDataContext.Tasks.Where(t => t.Id == taskId).AsNoTracking().AsQueryable();
        }

        public IPS.Data.Task Add(IPS.Data.Task task)
        {
            TaskList tasklist = _ipsDataContext.TaskLists.Where(tl => tl.Id == task.TaskListId && tl.UserId == task.CreatedById).FirstOrDefault();
            TaskList newTasklist = new TaskList();

            if (tasklist == null)
            {

                User user = _ipsDataContext.Users.Where(u => u.Id == task.CreatedById).FirstOrDefault();

                newTasklist.Name = user.FirstName + '.' + user.LastName + "TaskList";



                newTasklist.TaskStatusListId = _ipsDataContext.TaskStatusLists.Select(tsl => tsl.Id).FirstOrDefault();
                newTasklist.TaskPriorityListId = _ipsDataContext.TaskPriorityLists.Select(tpl => tpl.Id).FirstOrDefault();
                newTasklist.UserId = task.CreatedById;
                task.TaskListId = newTasklist.Id;
                _ipsDataContext.TaskLists.Add(newTasklist);
            }

            task.TaskCategoryListItem = null;
            task.TaskList = null;
            task.TaskPriorityListItem = null;
            task.Tasks1 = null;
            task.Task1 = null;
            task.TaskStatusListItem = null;
            task.Training = null;
            if (task.TrainingId == 0)
            {
                task.TrainingId = null;
                task.ProfileId = null;
                task.StageId = null;
            }

            _ipsDataContext.Tasks.Add(task);
            _ipsDataContext.SaveChanges();

            return task;
        }

        public void Update(IPS.Data.Task task)
        {

            var original = _ipsDataContext.Tasks.Find(task.Id);

            if (original != null)
            {
                task.TaskCategoryListItem = null;
                task.TaskList = null;
                task.TaskPriorityListItem = null;
                task.Tasks1 = null;
                task.Task1 = null;
                task.TaskStatusListItem = null;
                task.Training = null;

                if (task.IsCompleted)
                {
                    task.CompletedDate = DateTime.Now;
                }
                if (task.TrainingId == 0)
                {
                    task.TrainingId = null;
                }
                _ipsDataContext.Entry(original).CurrentValues.SetValues(task);
                _ipsDataContext.SaveChanges();
            }

        }

        public void IsCompleted(int taskId, bool isCompleted)
        {
            var original = _ipsDataContext.Tasks.Find(taskId);
            original.IsCompleted = isCompleted;
            if (isCompleted)
            {
                original.CompletedDate = DateTime.Now;
            }
            _ipsDataContext.SaveChanges();
        }

        public void Delete(IPS.Data.Task task)
        {
            IPS.Data.Task original = _ipsDataContext.Tasks.Where(t => t.Id == task.Id).FirstOrDefault();

            if (original != null)
            {

                _ipsDataContext.Tasks.Remove(original);
                _ipsDataContext.SaveChanges();
            }
        }

        public List<Training> GetAvailableTaskTrainings(int userId)
        {
            List<Training> trainings = new List<Training>();
            User user = _ipsDataContext.Users.Include("Organization.Trainings").Where(u => u.Id == userId).AsNoTracking().FirstOrDefault();
            if (user != null)
            {
                DateTime today = DateTime.Now;
                List<Training> organizationTrainings = user.Organization.Trainings.Where(x => x.StartDate <= today && x.EndDate >= today).ToList();
                trainings.AddRange(organizationTrainings);
                var assignedTrainings = _ipsDataContext.EvaluationAgreements.Include("Trainings")
                    .Join(_ipsDataContext.Stages, a => a.StageId, s => s.Id, (a, s) => new { a, s })
                    .Where(ast => ast.s.StartDateTime <= today && ast.a.EvaluationParticipant.UserId == userId)
                    .AsNoTracking()
                    .ToList();
                foreach (var ea in assignedTrainings)
                {
                    foreach (var t in ea.a.Trainings.Where(x => x.StartDate <= today && x.EndDate >= today))
                    {
                        if (!trainings.Any(tr => tr.Id == t.Id))
                        {
                            trainings.Add(t);
                        }

                    }
                }
            }
            return trainings.OrderBy(t => t.Name).ToList();
        }


        public IQueryable<Data.Task> GetAllForEmailNotification()
        {
            List<Data.Task> result = new List<Data.Task>();
            DateTime now = DateTime.Now;
            DateTime lastDate = now.AddMinutes(5);
            List<Data.Task> tasks = _ipsDataContext.Tasks.Where(x => x.AssignedToId > 0 && x.IsEmailNotification == true && x.StartDate > now).ToList();
            foreach (Data.Task task in tasks)
            {
                double remindBefore = (Double)((task.EmailBefore == null) ? 0 : task.EmailBefore);
                if (task.StartDate.HasValue)
                {
                    if (task.StartDate.Value.AddMinutes(remindBefore) > now && task.StartDate.Value.AddMinutes(remindBefore) < lastDate)
                    {
                        task.StartDate = task.StartDate.Value.AddMinutes(remindBefore);
                        result.Add(task);
                    }
                }
            }
            return result.AsQueryable();
        }

        public IQueryable<Data.Task> GetAllRecurrenceTasksForEmailNotification()
        {
            DateTime now = DateTime.Now;
            List<Data.Task> result = new List<Data.Task>();
            List<Data.Task> tasks = _ipsDataContext.Tasks.Where(x => x.AssignedToId > 0 && x.IsEmailNotification == true && x.DueDate > now && x.StartDate < now).ToList();
            foreach (Data.Task task in tasks)
            {
                double remindBefore = (Double)((task.EmailBefore == null) ? 0 : task.EmailBefore);
                List<DateTime> recurrencesTask = RecurrenceRuleParser.GetRecurrenceDateTime(task.RecurrenceRule, (DateTime)task.StartDate, (DateTime)task.DueDate);
                foreach (DateTime recurrence in recurrencesTask)
                {
                    if (recurrence.AddMinutes(remindBefore) > now && recurrence.AddMinutes(remindBefore) < now.AddMinutes(5))
                    {
                        task.StartDate = recurrence.AddMinutes(remindBefore);
                        result.Add(task);
                    }
                }
            }
            return result.AsQueryable();
        }


        public IQueryable<Data.Task> GetAllForSMSNotification()
        {
            List<Data.Task> result = new List<Data.Task>();
            DateTime now = DateTime.Now;
            DateTime lastDate = now.AddMinutes(5);
            List<Data.Task> tasks = _ipsDataContext.Tasks.Where(x => x.AssignedToId > 0 && x.IsSMSNotification == true && x.StartDate > now).ToList();
            foreach (Data.Task task in tasks)
            {
                double remindBefore = (Double)((task.SmsBefore == null) ? 0 : task.EmailBefore);
                if (task.StartDate.HasValue)
                {
                    if (task.StartDate.Value.AddMinutes(remindBefore) > now && task.StartDate.Value.AddMinutes(remindBefore) < lastDate)
                    {
                        task.StartDate = task.StartDate.Value.AddMinutes(remindBefore);
                        result.Add(task);
                    }
                }
            }
            return result.AsQueryable();
        }
        public IQueryable<Data.Task> GetAllRecurrenceTasksForSMSNotification()
        {
            DateTime now = DateTime.Now;
            List<Data.Task> result = new List<Data.Task>();
            List<Data.Task> tasks = _ipsDataContext.Tasks.Where(x => x.AssignedToId > 0 && x.IsSMSNotification == true && x.DueDate > now && x.StartDate < now).ToList();
            foreach (Data.Task task in tasks)
            {
                double remindBefore = (Double)((task.SmsBefore == null) ? 0 : task.SmsBefore);
                List<DateTime> recurrencesTask = RecurrenceRuleParser.GetRecurrenceDateTime(task.RecurrenceRule, (DateTime)task.StartDate, (DateTime)task.DueDate);
                foreach (DateTime recurrence in recurrencesTask)
                {
                    if (recurrence.AddMinutes(remindBefore) > now && recurrence.AddMinutes(remindBefore) < now.AddMinutes(5))
                    {
                        task.StartDate = recurrence.AddMinutes(remindBefore);
                        result.Add(task);
                    }
                }
            }
            return result.AsQueryable();
        }


        public List<IPSTaskActivityModel> GetRecurrenceTaskActivity(int taskId)
        {
            return _ipsDataContext.TaskActivities.Where(x => x.TaskId == taskId).Select(x => new IPSTaskActivityModel()
            {
                ActivityDateTime = x.ActivityDateTime,
                Id = x.Id,
                RecurrenceEndTime = x.RecurrenceEndTime,
                RecurrencesRule = x.RecurrencesRule,
                TaskId = x.TaskId,
                RecurrenceStartTime = x.RecurrenceStartTime
            }).ToList();
        }


        public IPSTaskModel GetTaskDetailById(int taskId)
        {
            return _ipsDataContext.Tasks.Where(t => t.Id == taskId).Select(x => new IPSTaskModel()
            {
                Description = x.Description,
                DueDate = x.DueDate,
                Id = x.Id,
                StartDate = x.StartDate,
                StatusId = x.StatusId,
                Title = x.Title,
                RecurrenceRule = x.RecurrenceRule,
                TaskActivities = x.TaskActivities.Select(a => new IPSTaskActivityModel()
                {
                    TaskId = a.TaskId,
                    Id = a.Id,
                    ActivityDateTime = a.ActivityDateTime,
                    RecurrenceEndTime = a.RecurrenceEndTime,
                    RecurrencesRule = a.RecurrencesRule,
                    RecurrenceStartTime = a.RecurrenceStartTime,
                }).ToList()
            }).FirstOrDefault();
        }
        public Training getTrainingById(int trainingId)
        {
            Training result = _ipsDataContext.Trainings.Where(x => x.Id == trainingId).FirstOrDefault();
            return result;

        }
        #region Private

        private int GetCategoryListId(int userId)
        {
            TaskCategoryListsService taskCategoryListsService = new TaskCategoryListsService();
            TaskCategoryList taskCategoryList = taskCategoryListsService.GetUserlist(userId).FirstOrDefault();
            int taskCategoryListId;
            if (!taskCategoryList.UserId.HasValue)
            {
                taskCategoryListId = taskCategoryListsService.CreateFromTemplate(taskCategoryList, taskCategoryList.OrganizationId.Value, null, null, userId);
            }
            else
            {
                taskCategoryListId = taskCategoryList.Id;
            }

            return taskCategoryListId;
        }

        private int GetPriorityListId(int userId)
        {
            TaskPriorityListsService taskPriorityListsService = new TaskPriorityListsService();
            TaskPriorityList taskPriorityList = taskPriorityListsService.GetUserlist(userId).FirstOrDefault();
            int taskPriorityListId;
            if (!taskPriorityList.UserId.HasValue)
            {
                taskPriorityListId = taskPriorityListsService.CreateFromTemplate(taskPriorityList, taskPriorityList.OrganizationId.Value, null, null, userId);
            }
            else
            {
                taskPriorityListId = taskPriorityList.Id;
            }

            return taskPriorityListId;
        }

        private int GetStatusListId(int userId)
        {
            TaskStatusListsService taskStatusListsService = new TaskStatusListsService();
            TaskStatusList taskStatusList = taskStatusListsService.GetUserlist(userId).FirstOrDefault();
            int taskStatusListId;
            if (!taskStatusList.UserId.HasValue)
            {
                taskStatusListId = taskStatusListsService.CreateFromTemplate(taskStatusList, taskStatusList.OrganizationId.Value, null, null, userId);
            }
            else
            {
                taskStatusListId = taskStatusList.Id;
            }

            return taskStatusListId;
        }

        #endregion

        public List<IPSTaskModel> getProspectingTasksbyUserId(int userId)
        {
            List<int> ProspectingTaskIds = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.UserId == userId && x.TaskId > 0).Select(x => (int)x.TaskId).ToList();
            List<IPSTaskModel> result = _ipsDataContext.Tasks.Where(t => ProspectingTaskIds.Contains(t.Id)).Select(x => new IPSTaskModel()
            {
                Description = x.Description,
                DueDate = x.DueDate,
                Id = x.Id,
                StartDate = x.StartDate,
                StatusId = x.StatusId,
                Title = x.Title,
                RecurrenceRule = x.RecurrenceRule,
            }).ToList();
            return result;
        }


        public List<ProspectingGoalResultModel> getUserTaskAggregatedSalesActivityData(ActivityResultFilterOptionModel activityResultFilterOptionModel)
        {
            List<ProspectingGoalResultModel> result = new List<ProspectingGoalResultModel>();
            List<ProspectingGoalInfo> prospectingGoals = new List<ProspectingGoalInfo>();
            if (activityResultFilterOptionModel.StartDate.HasValue && activityResultFilterOptionModel.EndDate.HasValue)
            {
                prospectingGoals = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.TaskId == activityResultFilterOptionModel.TaskId && x.UserId == activityResultFilterOptionModel.UserId && x.GoalStartDate >= activityResultFilterOptionModel.StartDate.Value && x.GoalStartDate <= activityResultFilterOptionModel.EndDate.Value).ToList();
            }
            else
            {
                prospectingGoals = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.TaskId == activityResultFilterOptionModel.TaskId && x.UserId == activityResultFilterOptionModel.UserId).ToList();
            }
            foreach (ProspectingGoalInfo prospectingGoal in prospectingGoals)
            {
                if (prospectingGoal != null)
                {
                    ProspectingGoalResultModel prospectingGoalResultModel = new ProspectingGoalResultModel();
                    List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                    prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();

                    SkillsService _skillService = new SkillsService();
                    List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                    if (prospectingGoal.ProfileId.HasValue)
                    {
                        skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                    }
                    else
                    {
                        skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                    }

                    List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();

                    foreach (IpsSkillDDL skill in skills)
                    {
                        int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                        int skillResultCount = 0;
                        if (activityResultFilterOptionModel.StartDate.HasValue && activityResultFilterOptionModel.EndDate.HasValue)
                        {
                            skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.CreatedOn >= activityResultFilterOptionModel.StartDate.Value && x.CreatedOn <= activityResultFilterOptionModel.EndDate.Value).Count();
                        }
                        else
                        {
                            skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true).Count();
                        }
                        prospectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {

                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = skillResultCount,
                            Result = skillResultCount > 0 ? ((skillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });
                    }

                    prospectingGoalResultModel.Id = prospectingGoal.Id;
                    prospectingGoalResultModel.ProspectingName = prospectingGoal.Name;
                    prospectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    prospectingGoalResultModel.UserId = activityResultFilterOptionModel.UserId;
                    prospectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    prospectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    prospectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    result.Add(prospectingGoalResultModel);
                }
            }
            return result;
        }

        public List<UserSalesActivityResultDataModel> getUserTaskSalesActivityData(ActivityResultFilterOptionModel activityResultFilterOptionModel)
        {
            List<UserSalesActivityResultDataModel> result = new List<UserSalesActivityResultDataModel>();
            SkillsService _skillService = new SkillsService();

            DateTime today = DateTime.Today;
            DateTime endOfDay = DateTime.Today.AddDays(1);
            List<ProspectingGoalInfo> prospectingGoalList = new List<ProspectingGoalInfo>();
            if (activityResultFilterOptionModel.StartDate.HasValue && activityResultFilterOptionModel.EndDate.HasValue)
            {
                prospectingGoalList = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.TaskId == activityResultFilterOptionModel.TaskId && x.UserId == activityResultFilterOptionModel.UserId && x.GoalStartDate >= activityResultFilterOptionModel.StartDate.Value && x.GoalStartDate <= activityResultFilterOptionModel.EndDate.Value).ToList();
            }
            else
            {
                prospectingGoalList = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.TaskId == activityResultFilterOptionModel.TaskId && x.UserId == activityResultFilterOptionModel.UserId).ToList();
            }
            foreach (ProspectingGoalInfo prospectingGoalListItem in prospectingGoalList)
            {
                List<IpsSkillDDL> skills = _skillService.getSkillsByProspectingGoalId(prospectingGoalListItem.Id).OrderBy(x => x.SeqNo).ToList();

                UserSalesActivityResultDataModel userProspectingResultModel = new UserSalesActivityResultDataModel();
                List<ProspectingGoalActivityInfo> ProspectingGoalActivityInfoes = _ipsDataContext.ProspectingGoalActivityInfoes.Where(x => x.ProspectingGoalId == prospectingGoalListItem.Id).ToList();
                foreach (ProspectingGoalActivityInfo prospectingGoalActivityInfo in ProspectingGoalActivityInfoes)
                {
                    List<ProspectingActivity> prospectingActivities = new List<ProspectingActivity>();
                    if (activityResultFilterOptionModel.StartDate.HasValue && activityResultFilterOptionModel.EndDate.HasValue)
                    {
                        prospectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => x.ProspectingGoalActivityId == prospectingGoalActivityInfo.Id && x.ActivityStart >= activityResultFilterOptionModel.StartDate.Value && x.ActivityEnd <= activityResultFilterOptionModel.EndDate.Value).ToList();
                    }
                    else
                    {
                        prospectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => x.ProspectingGoalActivityId == prospectingGoalActivityInfo.Id).ToList();
                    }
                    //userProspectingResultModel

                    foreach (ProspectingActivity prospectingActivity in prospectingActivities)
                    {
                        userProspectingResultModel = new UserSalesActivityResultDataModel()
                        {
                            ActvitiyName = prospectingActivity.Name,
                            ActvitiyStart = prospectingActivity.ActivityStart,
                            ActvitiyEnd = prospectingActivity.ActivityEnd,
                            GoalEndDate = prospectingGoalListItem.GoalEndDate,
                            GoalStartDate = prospectingGoalListItem.GoalStartDate,
                            ProspectingGoalId = prospectingGoalListItem.Id,
                            ProspectingGoalName = prospectingGoalListItem.Name,
                            UserStartTime = prospectingActivity.StartTime,
                            UserStopTime = prospectingActivity.StopTime,
                        };

                        foreach (IpsSkillDDL skill in skills)
                        {
                            int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoalListItem.Id).Select(x => x.Goal).FirstOrDefault();
                            int skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && x.ProspectingActivityId == prospectingActivity.Id && x.IsDone == true).Count();
                            userProspectingResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                            {
                                ProspectingGoalId = prospectingGoalListItem.Id,
                                SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                                SkillName = skill.Name,
                                Goal = skillGoal,
                                Count = skillResultCount,
                                Result = skillResultCount > 0 ? ((skillResultCount * 100) / skillGoal) : 0,
                                SeqNo = skill.SeqNo,
                            });

                            if (!(skillResultCount > 0))
                            {
                                if (userProspectingResultModel.ActvitiyStart > endOfDay)
                                {
                                    userProspectingResultModel.ActivityStatus = "Up-Coming";
                                }
                                else if (userProspectingResultModel.ActvitiyStart >= today && userProspectingResultModel.ActvitiyStart < endOfDay)
                                {
                                    userProspectingResultModel.ActivityStatus = "Pending";
                                }
                                else if (userProspectingResultModel.ActvitiyEnd <= today)
                                {
                                    userProspectingResultModel.ActivityStatus = "Expired";
                                }
                            }
                            else
                            {
                                if (userProspectingResultModel.UserStopTime == null)
                                {
                                    if (userProspectingResultModel.ActvitiyStart >= today && userProspectingResultModel.ActvitiyStart < endOfDay && userProspectingResultModel.UserStopTime == null)
                                    {
                                        userProspectingResultModel.ActivityStatus = "Pending";
                                    }
                                }
                                else
                                {
                                    userProspectingResultModel.ActivityStatus = "Completed";
                                }
                            }
                            if (prospectingActivity.ExpiredProspectingActivityReasons.Count() > 0)
                            {
                                userProspectingResultModel.ExpiredActivityReason = prospectingActivity.ExpiredProspectingActivityReasons.Select(x => x.Reason).FirstOrDefault();
                            }
                        }
                        result.Add(userProspectingResultModel);
                    }
                }
            }
            return result;
        }
        public List<UserSalesActivityResultDataModel> getUserTaskSalesActivityChartData(ActivityResultFilterOptionModel activityResultFilterOptionModel)
        {
            List<UserSalesActivityResultDataModel> result = new List<UserSalesActivityResultDataModel>();
            SkillsService _skillService = new SkillsService();

            DateTime today = DateTime.Today;
            DateTime endOfDay = DateTime.Today.AddDays(1);
            List<ProspectingGoalInfo> prospectingGoalList = new List<ProspectingGoalInfo>();
            if (activityResultFilterOptionModel.UserId > 0)
            {
                prospectingGoalList = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.TaskId == activityResultFilterOptionModel.TaskId && x.UserId == activityResultFilterOptionModel.UserId).ToList();
            }
            else
            {
                prospectingGoalList = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.TaskId == activityResultFilterOptionModel.TaskId).ToList();
            }
            foreach (ProspectingGoalInfo prospectingGoalListItem in prospectingGoalList)
            {
                List<IpsSkillDDL> skills = _skillService.getSkillsByProspectingGoalId(prospectingGoalListItem.Id).OrderBy(x => x.SeqNo).ToList();

                UserSalesActivityResultDataModel userProspectingResultModel = new UserSalesActivityResultDataModel();
                List<ProspectingGoalActivityInfo> ProspectingGoalActivityInfoes = _ipsDataContext.ProspectingGoalActivityInfoes.Where(x => x.ProspectingGoalId == prospectingGoalListItem.Id).ToList();
                foreach (ProspectingGoalActivityInfo prospectingGoalActivityInfo in ProspectingGoalActivityInfoes)
                {
                    List<ProspectingActivity> prospectingActivities = new List<ProspectingActivity>();
                    if (activityResultFilterOptionModel.StartDate.HasValue && activityResultFilterOptionModel.EndDate.HasValue)
                    {
                        prospectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => x.ProspectingGoalActivityId == prospectingGoalActivityInfo.Id && x.ActivityStart >= activityResultFilterOptionModel.StartDate.Value && x.ActivityEnd <= activityResultFilterOptionModel.EndDate.Value).ToList();
                    }
                    else
                    {
                        prospectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => x.ProspectingGoalActivityId == prospectingGoalActivityInfo.Id).ToList();
                    }
                    //userProspectingResultModel

                    foreach (ProspectingActivity prospectingActivity in prospectingActivities)
                    {
                        userProspectingResultModel = new UserSalesActivityResultDataModel()
                        {
                            ActvitiyName = prospectingActivity.Name,
                            ActvitiyStart = prospectingActivity.ActivityStart,
                            ActvitiyEnd = prospectingActivity.ActivityEnd,
                            GoalEndDate = prospectingGoalListItem.GoalEndDate,
                            GoalStartDate = prospectingGoalListItem.GoalStartDate,
                            ProspectingGoalId = prospectingGoalListItem.Id,
                            ProspectingGoalName = prospectingGoalListItem.Name,
                            UserStartTime = prospectingActivity.StartTime,
                            UserStopTime = prospectingActivity.StopTime,
                        };

                        foreach (IpsSkillDDL skill in skills)
                        {
                            int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoalListItem.Id).Select(x => x.Goal).FirstOrDefault();
                            int skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && x.ProspectingActivityId == prospectingActivity.Id && x.IsDone == true).Count();
                            userProspectingResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                            {
                                ProspectingGoalId = prospectingGoalListItem.Id,
                                SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                                SkillName = skill.Name,
                                Goal = skillGoal,
                                Count = skillResultCount,
                                Result = skillResultCount > 0 ? ((skillResultCount * 100) / skillGoal) : 0,
                                SeqNo = skill.SeqNo,
                            });

                            if (!(skillResultCount > 0))
                            {
                                if (userProspectingResultModel.ActvitiyStart > endOfDay)
                                {
                                    userProspectingResultModel.ActivityStatus = "Up-Coming";
                                }
                                else if (userProspectingResultModel.ActvitiyStart >= today && userProspectingResultModel.ActvitiyStart < endOfDay)
                                {
                                    userProspectingResultModel.ActivityStatus = "Pending";
                                }
                                else if (userProspectingResultModel.ActvitiyEnd <= today)
                                {
                                    userProspectingResultModel.ActivityStatus = "Expired";
                                }
                            }
                            else
                            {
                                if (userProspectingResultModel.UserStopTime == null)
                                {
                                    if (userProspectingResultModel.ActvitiyStart >= today && userProspectingResultModel.ActvitiyStart < endOfDay && userProspectingResultModel.UserStopTime == null)
                                    {
                                        userProspectingResultModel.ActivityStatus = "Pending";
                                    }
                                }
                                else
                                {
                                    userProspectingResultModel.ActivityStatus = "Completed";
                                }
                            }
                            if (prospectingActivity.ExpiredProspectingActivityReasons.Count() > 0)
                            {
                                userProspectingResultModel.ExpiredActivityReason = prospectingActivity.ExpiredProspectingActivityReasons.Select(x => x.Reason).FirstOrDefault();
                            }
                        }
                        result.Add(userProspectingResultModel);
                    }
                }
            }
            return result;
        }


        public List<UserSalesActivityResultDataModel> getUserTaskServiceActivityData(ActivityResultFilterOptionModel activityResultFilterOptionModel)
        {
            List<UserSalesActivityResultDataModel> result = new List<UserSalesActivityResultDataModel>();
            SkillsService _skillService = new SkillsService();

            DateTime today = DateTime.Today;
            DateTime endOfDay = DateTime.Today.AddDays(1);
            List<ProspectingGoalInfo> prospectingGoalList = new List<ProspectingGoalInfo>();
            if (activityResultFilterOptionModel.StartDate.HasValue && activityResultFilterOptionModel.EndDate.HasValue)
            {
                prospectingGoalList = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.TaskId == activityResultFilterOptionModel.TaskId && x.UserId == activityResultFilterOptionModel.UserId && x.GoalStartDate >= activityResultFilterOptionModel.StartDate.Value && x.GoalStartDate <= activityResultFilterOptionModel.EndDate.Value).ToList();
            }
            else
            {
                prospectingGoalList = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.TaskId == activityResultFilterOptionModel.TaskId && x.UserId == activityResultFilterOptionModel.UserId).ToList();
            }
            foreach (ProspectingGoalInfo prospectingGoalListItem in prospectingGoalList)
            {
                List<IpsSkillDDL> skills = _skillService.getSkillsByProspectingGoalId(prospectingGoalListItem.Id).OrderBy(x => x.SeqNo).ToList();

                UserSalesActivityResultDataModel userProspectingResultModel = new UserSalesActivityResultDataModel();
                List<ProspectingGoalActivityInfo> ProspectingGoalActivityInfoes = _ipsDataContext.ProspectingGoalActivityInfoes.Where(x => x.ProspectingGoalId == prospectingGoalListItem.Id).ToList();
                foreach (ProspectingGoalActivityInfo prospectingGoalActivityInfo in ProspectingGoalActivityInfoes)
                {
                    List<ProspectingActivity> prospectingActivities = new List<ProspectingActivity>();
                    if (activityResultFilterOptionModel.StartDate.HasValue && activityResultFilterOptionModel.EndDate.HasValue)
                    {
                        prospectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => x.ProspectingGoalActivityId == prospectingGoalActivityInfo.Id && x.ActivityStart >= activityResultFilterOptionModel.StartDate.Value && x.ActivityEnd <= activityResultFilterOptionModel.EndDate.Value).ToList();
                    }
                    else
                    {
                        prospectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => x.ProspectingGoalActivityId == prospectingGoalActivityInfo.Id).ToList();
                    }
                    //userProspectingResultModel

                    foreach (ProspectingActivity prospectingActivity in prospectingActivities)
                    {
                        userProspectingResultModel = new UserSalesActivityResultDataModel()
                        {
                            ActvitiyName = prospectingActivity.Name,
                            ActvitiyStart = prospectingActivity.ActivityStart,
                            ActvitiyEnd = prospectingActivity.ActivityEnd,
                            GoalEndDate = prospectingGoalListItem.GoalEndDate,
                            GoalStartDate = prospectingGoalListItem.GoalStartDate,
                            ProspectingGoalId = prospectingGoalListItem.Id,
                            ProspectingGoalName = prospectingGoalListItem.Name,
                            UserStartTime = prospectingActivity.StartTime,
                            UserStopTime = prospectingActivity.StopTime,
                        };

                        foreach (IpsSkillDDL skill in skills)
                        {
                            int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoalListItem.Id).Select(x => x.Goal).FirstOrDefault();
                            int skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && x.ProspectingActivityId == prospectingActivity.Id && x.IsDone == true && x.ProspectingType == (int)ProspectingTypeEnum.Service).Count();
                            userProspectingResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                            {
                                ProspectingGoalId = prospectingGoalListItem.Id,
                                SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                                SkillName = skill.Name,
                                Goal = skillGoal,
                                Count = skillResultCount,
                                Result = skillResultCount > 0 ? ((skillResultCount * 100) / skillGoal) : 0,
                                SeqNo = skill.SeqNo,
                            });

                            if (!(skillResultCount > 0))
                            {
                                if (userProspectingResultModel.ActvitiyStart > endOfDay)
                                {
                                    userProspectingResultModel.ActivityStatus = "Up-Coming";
                                }
                                else if (userProspectingResultModel.ActvitiyStart >= today && userProspectingResultModel.ActvitiyStart < endOfDay)
                                {
                                    userProspectingResultModel.ActivityStatus = "Pending";
                                }
                                else if (userProspectingResultModel.ActvitiyEnd <= today)
                                {
                                    userProspectingResultModel.ActivityStatus = "Expired";
                                }
                            }
                            else
                            {
                                if (userProspectingResultModel.UserStopTime == null)
                                {
                                    if (userProspectingResultModel.ActvitiyStart >= today && userProspectingResultModel.ActvitiyStart < endOfDay && userProspectingResultModel.UserStopTime == null)
                                    {
                                        userProspectingResultModel.ActivityStatus = "Pending";
                                    }
                                }
                                else
                                {
                                    userProspectingResultModel.ActivityStatus = "Completed";
                                }
                            }
                            if (prospectingActivity.ExpiredProspectingActivityReasons.Count() > 0)
                            {
                                userProspectingResultModel.ExpiredActivityReason = prospectingActivity.ExpiredProspectingActivityReasons.Select(x => x.Reason).FirstOrDefault();
                            }
                        }
                        result.Add(userProspectingResultModel);
                    }
                }
            }
            return result;
        }

        public Data.Task CloneTask(int taskId)
        {
            Data.Task result = null;
            Data.Task oldTask = _ipsDataContext.Tasks.Where(t => t.Id == taskId).AsNoTracking().FirstOrDefault();
            if (oldTask != null)
            {
                Data.Task newTask = new Data.Task()
                {
                    CategoryId = oldTask.CategoryId,
                    Description = oldTask.Description,
                    EmailBefore = oldTask.EmailBefore,
                    FollowUpNotificationTemplateId = oldTask.FollowUpNotificationTemplateId,
                    IsCompleted = false,
                    IsEmailNotification = oldTask.IsEmailNotification,
                    IsSMSNotification = oldTask.IsSMSNotification,
                    MeetingNotificationTemplateId = oldTask.MeetingNotificationTemplateId,
                    NotificationTemplateId = oldTask.NotificationTemplateId,
                    ParentTaskID = oldTask.ParentTaskID,
                    PriorityId = oldTask.PriorityId,
                    ProfileId = oldTask.ProfileId,
                    ProjectId = oldTask.ProjectId,
                    RecurrenceRule = oldTask.RecurrenceRule,
                    SalesNotificationTemplateId = oldTask.SalesNotificationTemplateId,
                    SmsBefore = oldTask.SmsBefore,
                    StageId = oldTask.StageId,
                    StatusId = null,
                    TaskListId = oldTask.TaskListId,
                    TimeEstimateMinutes = oldTask.TimeEstimateMinutes,
                    TimeSpentMinutes = 0,
                    Title = getTaskName(oldTask.Title + " Clone"),
                    TrainingId = oldTask.TrainingId,
                    UserId = oldTask.UserId,
                    StartDate = DateTime.Today.AddHours(8),
                    DueDate = DateTime.Today.AddHours(17),
                    AssignedToId = _authService.GetCurrentUserId(),
                    CreatedById = _authService.GetCurrentUserId(),
                    CreatedDate = DateTime.Now,
                    CompletedDate = null,
                };
                newTask.Id = 0;
                IpsUser user = _authService.getCurrentUser();
                newTask.CreatedByName = user.FirstName + " " + user.LastName;
                if (oldTask.DueDate.HasValue && oldTask.StartDate.HasValue)
                {
                    double totalDays = (oldTask.DueDate.Value - oldTask.StartDate.Value).TotalDays;
                    DateTime dueDate = DateTime.Today.AddDays(totalDays).AddHours(17);
                    newTask.DueDate = dueDate;
                }
                TaskList taskList = _ipsDataContext.TaskLists.Where(x => x.UserId == newTask.AssignedToId).FirstOrDefault();
                newTask.TaskListId = taskList.Id;
                TaskStatusListItem statusListItem = _ipsDataContext.TaskStatusListItems.Where(x => x.TaskStatusListId == taskList.TaskStatusListId && x.Name.Contains("Not Started")).FirstOrDefault();
                if (statusListItem != null)
                {
                    newTask.StatusId = statusListItem.Id;
                }
                result = Add(newTask);
            }
            return result;
        }

        private string getTaskName(string taskName)
        {
            string newTitle = taskName;
            int existTask = _ipsDataContext.Tasks.Where(x => x.Title.StartsWith(taskName) == true).Count();
            if (existTask > 0)
            {
                newTitle = taskName + " " + (existTask);
            }
            return newTitle;
        }



    }
}
