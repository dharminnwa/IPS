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
using System.Web;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class TaskStatusesController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        ITaskStatusListsService _listService;
        ITaskStatusListItemsService _itemsService;
        public TaskStatusesController(ITaskStatusListsService listService, ITaskStatusListItemsService itemsService)
        {
            _listService = listService;
            _itemsService = itemsService;
        }

        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        [Route("api/TaskStatuses/items")]
        public IQueryable<TaskStatusListItem> Get()
        {
            return _itemsService.Get();
        }

        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        [Route("api/TaskStatuses/{id}")]
        public SingleResult<TaskStatusList> GetTasksListById(int id)
        {
            SingleResult<TaskStatusList> result = SingleResult.Create(_listService.GetTasksListById(id));
            return result;
        }


        [HttpGet]
        [Route("api/TaskStatuses/itemsbystatuslistid/{statusListId}")]
        public List<TaskStatusListItemModel> GetStatusListItemsByStatusListId(int statusListId)
        {
            List<TaskStatusListItemModel> result = _itemsService.GetStatusListItemsByStatusListId(statusListId);
            return result;
        }

        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        [Route("api/TaskStatuses/user/{userId}")]
        public SingleResult<TaskStatusList> GetTaskStatusListByUserId(int id)
        {
            SingleResult<TaskStatusList> result = SingleResult.Create(_listService.GetUserlist(id));
            return result;
        }

        [Route("api/TaskStatuses/{organizationId}/{departmentId?}/{teamId?}/{userId?}")]
        [EnableQuery(MaxExpansionDepth = 4)]
        [HttpGet]
        public IHttpActionResult GetByOrganizationId(int organizationId, int? departmentId, int? teamId, int? userId)
        {

            IQueryable<TaskStatusList> taskStatusList = _listService.Get(organizationId, departmentId, teamId, userId);
            if (taskStatusList == null || taskStatusList.Count() == 0)
            {
                return Ok(HttpStatusCode.NotFound); 
            }
            SingleResult<TaskStatusList> result = SingleResult.Create(taskStatusList);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/TaskStatuses/{organizationId}/{departmentId?}/{teamId?}/{userId?}/list")]
        public IHttpActionResult CreateFromDefaultTemplate(int organizationId, int? departmentId, int? teamId, int? userId)
        {
            int listId = _listService.CreateFromDefaultTemplate(organizationId, departmentId, teamId, userId);

            return Ok(listId);
        }

        [HttpPost]
        [Route("api/TaskStatuses/listItem")]
        public IHttpActionResult Add(TaskStatusListItem item)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TaskStatusListItem result = _itemsService.Add(item);

            return Ok(item.Id);
        }


        [HttpPut]
        [Route("api/TaskStatuses/listItem")]
        public IHttpActionResult Update(TaskStatusListItem item)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TaskStatusListItem obj = _itemsService.GetTasksListById(item.Id).FirstOrDefault();

            if (obj == null)
            {
                return NotFound();
            }

            try
            {
                _itemsService.Update(item);

                return Ok(HttpStatusCode.OK);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
        }


        [HttpDelete]
        [Route("api/TaskStatuses/listItem/{id}")]
        public IHttpActionResult Delete(int id)
        {
            try
            {
                TaskStatusListItem task = _itemsService.GetTasksListById(id).FirstOrDefault();
                if (task == null)
                {
                    return NotFound();
                }

                _itemsService.Delete(task);

                return Ok(HttpStatusCode.OK);

            }
            catch (DbUpdateException)
            {
                return BadRequest("Task is used in other task");
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Task was not deleted due to server error");
            }
        }

    }
}