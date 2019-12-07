using IPS.AuthData.Managers;
using IPS.AuthData.Models;
using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
using IPS.BusinessModels.TaskModels;
using IPS.Data;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.OData;
using IPS.BusinessModels.SalesActivityModels;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class TasksController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        ITaskService _taskService;
        IAuthService _authService;
        IUserService _userService;
        public TasksController(ITaskService taskService, IAuthService authService, IUserService userService)
        {
            _taskService = taskService;
            _authService = authService;
            _userService = userService;
        }


        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 3)]
        [Route("api/Tasks/list/user")]
        public SingleResult<TaskList> GetTasksListByUserId()
        {
            IpsUser user = _authService.getCurrentUser();
            SingleResult<TaskList> result = SingleResult.Create(_taskService.GetTasksListByUserKey(user.Id));
            return result;
        }


        [HttpGet]
        [Route("api/Tasks/GetTasksByUserId/{userId}")]
        public List<Task> GetTasksByUserId(int userId)
        {
            return _taskService.GetTasksByUserId(userId);
        }

        [HttpPost]
        [Route("api/Tasks/GetTasksByUserIds")]
        public List<Task> GetTasksByUserIds(List<int> userIds)
        {
            return _taskService.GetTasksByUserIds(userIds);
        }



        [HttpGet]
        [Route("api/Tasks/listItem/user")]
        public TaskListModel GetTaskslistItemByUserId()
        {
            IpsUser user = _authService.getCurrentUser();
            return _taskService.GetTasksListItemByUserKey(user.Id);

        }

        [HttpGet]
        [Route("api/Tasks/trainings")]
        public List<Training> GetAvailableTaskTrainings()
        {
            IpsUser userAccount = _authService.getCurrentUser();
            User user = userAccount != null ? _userService.GetUserByKey(userAccount.Id).FirstOrDefault() : null;
            int userId = user != null ? user.Id : 0;
            return _taskService.GetAvailableTaskTrainings(userId);
        }

        [HttpGet]
        [Route("api/Tasks/getTrainingById/{trainingId}")]
        public Training getTrainingById(int trainingId)
        {
            return _taskService.getTrainingById(trainingId);
        }

        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 2)]
        [Route("api/Tasks/user")]
        public IQueryable<Task> GetUserTasks()
        {
            IpsUser user = _authService.getCurrentUser();
            return _taskService.GetTasksByUserKey(user.Id);
        }

        [HttpGet]
        [Route("api/Tasks/list/{id}")]
        [EnableQuery(MaxExpansionDepth = 3)]
        public SingleResult<TaskList> GetTaskListById(int id)
        {
            SingleResult<TaskList> result = SingleResult.Create(_taskService.GetTaskListById(id));
            return result;
        }

        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 3)]
        public SingleResult<Task> GetTaskById(int id)
        {
            SingleResult<Task> result = SingleResult.Create(_taskService.GetTaskById(id));
            return result;
        }

        [HttpGet]
        [Route("api/Tasks/GetTaskDetailById/{id}")]
        public IPSTaskModel GetTaskDetailById(int id)
        {
            return _taskService.GetTaskDetailById(id);
        }

        [HttpPost]
        public IHttpActionResult Add(Task task)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Task result = _taskService.Add(task);

            return Ok(task.Id);
        }

        [HttpPut]
        public IHttpActionResult Update(Task task)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Task obj = _taskService.GetTaskById(task.Id).FirstOrDefault();

            if (obj == null)
            {
                return NotFound();
            }

            try
            {
                _taskService.Update(task);

                return Ok(HttpStatusCode.OK);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }


        }

        [HttpPut]
        [EnableQuery(MaxExpansionDepth = 3)]
        [Route("api/Tasks/{taskId}/IsCompleted/{IsCompleted}")]
        public IHttpActionResult IsCompleated(int taskId, bool isCompleted)
        {
            _taskService.IsCompleted(taskId, isCompleted);
            return Ok(HttpStatusCode.OK);
        }

        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {
            try
            {
                Task task = _taskService.GetTaskById(id).FirstOrDefault();
                if (task == null)
                {
                    return NotFound();
                }

                _taskService.Delete(task);

                return Ok(HttpStatusCode.OK);

            }
            catch (DbUpdateException ex)
            {
                Log.Error(ex);
                return BadRequest("Task is used in other task");
            }
            catch (Exception ex)
            {
                Log.Error(ex);
                return BadRequest("Task was not deleted due to server error");
            }
        }

        [HttpGet]
        [Route("api/Tasks/GetRecurrenceTaskActivity/{taskId}")]
        public List<IPSTaskActivityModel> GetRecurrenceTaskActivity(int taskId)
        {
            return _taskService.GetRecurrenceTaskActivity(taskId);
        }

        [HttpGet]
        [Route("api/Tasks/getProspectingTasksbyUserId/{userId}")]
        public List<IPSTaskModel> getProspectingTasksbyUserId(int userId)
        {
            return _taskService.getProspectingTasksbyUserId(userId);

        }

        [HttpPost]
        [Route("api/Tasks/getUserTaskAggregatedSalesActivityData")]
        public List<ProspectingGoalResultModel> getUserTaskAggregatedSalesActivityData(ActivityResultFilterOptionModel activityResultFilterOptionModel)
        {
            return _taskService.getUserTaskAggregatedSalesActivityData(activityResultFilterOptionModel);
        }

        [HttpPost]
        [Route("api/Tasks/getUserTaskSalesActivityData")]
        public List<UserSalesActivityResultDataModel> getUserTaskSalesActivityData(ActivityResultFilterOptionModel activityResultFilterOptionModel)
        {
            return _taskService.getUserTaskSalesActivityData(activityResultFilterOptionModel);
        }

        [HttpPost]
        [Route("api/Tasks/getUserTaskSalesActivityChartData")]
        public List<UserSalesActivityResultDataModel> getUserTaskSalesActivityChartData(ActivityResultFilterOptionModel activityResultFilterOptionModel)
        {
            return _taskService.getUserTaskSalesActivityChartData(activityResultFilterOptionModel);
        }

        [HttpPost]
        [Route("api/Tasks/getUserTaskServiceActivityData")]
        public List<UserSalesActivityResultDataModel> getUserTaskServiceActivityData(ActivityResultFilterOptionModel activityResultFilterOptionModel)
        {
            return _taskService.getUserTaskServiceActivityData(activityResultFilterOptionModel);
        }

        [HttpGet]
        [Route("api/Tasks/CloneTask/{id}")]
        public Data.Task CloneTask(int id)
        {
            Data.Task result = null;
            if (id > 0)
            {
                result = _taskService.CloneTask(id);
            }
            return result;
        }
    }
}