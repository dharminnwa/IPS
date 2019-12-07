using IPS.Data;
using IPS.BusinessModels.Entities;
using System;
using System.Linq;
using System.Collections.Generic;
using IPS.BusinessModels.TaskModels;
using IPS.BusinessModels.SalesActivityModels;

namespace IPS.Business
{
    public interface ITaskService
    {
        IQueryable<TaskList> GetTasksListByUserKey(string userKey);
        TaskListModel GetTasksListItemByUserKey(string userKey);
        IQueryable<Task> GetTaskById(int taskId);
        IPSTaskModel GetTaskDetailById(int taskId);
        IQueryable<IPS.Data.TaskList> GetTaskListById(int taskListId);
        IQueryable<IPS.Data.Task> GetTasksByListId(int taskListId);
        IQueryable<IPS.Data.Task> GetTasksByUserKey(string userKey);
        List<IPS.Data.Task> GetTasksByUserId(int userId);
        List<IPS.Data.Task> GetTasksByUserIds(List<int> userIds);
        
        List<Training> GetAvailableTaskTrainings(int userId);
        Task Add(Task task);
        void Delete(Task task);
        void Update(Task task);
        void IsCompleted(int taskId, bool isCompleted);
        IQueryable<Data.Task> GetAllForEmailNotification();
        IQueryable<Data.Task> GetAllRecurrenceTasksForEmailNotification();

        IQueryable<Data.Task> GetAllForSMSNotification();
        IQueryable<Data.Task> GetAllRecurrenceTasksForSMSNotification();

        List<IPSTaskActivityModel> GetRecurrenceTaskActivity(int taskId);
        Training getTrainingById(int trainingId);
        List<IPSTaskModel> getProspectingTasksbyUserId(int userId);
        List<ProspectingGoalResultModel> getUserTaskAggregatedSalesActivityData(ActivityResultFilterOptionModel activityResultFilterOptionModel);
        List<UserSalesActivityResultDataModel> getUserTaskSalesActivityData(ActivityResultFilterOptionModel activityResultFilterOptionModel);
        List<UserSalesActivityResultDataModel> getUserTaskSalesActivityChartData(ActivityResultFilterOptionModel activityResultFilterOptionModel);
        List<UserSalesActivityResultDataModel> getUserTaskServiceActivityData(ActivityResultFilterOptionModel activityResultFilterOptionModel);

        Data.Task CloneTask(int taskId);
    }
}
