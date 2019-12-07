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
    public class TaskPrioritiesController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        ITaskPriorityListsService _listService;
        ITaskPriorityListItemsService _itemsService;
        public TaskPrioritiesController(ITaskPriorityListsService listService, ITaskPriorityListItemsService itemsService)
        {
            _listService = listService;
            _itemsService = itemsService;
        }

        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        [Route("api/TaskPriorities/items")]
        public IQueryable<TaskPriorityListItem> Get()
        {
            return _itemsService.Get();
        }

        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        [Route("api/TaskPriorities/{id}")]
        public SingleResult<TaskPriorityList> GetTasksListById(int id)
        {
            SingleResult<TaskPriorityList> result = SingleResult.Create(_listService.GetTasksListById(id));
            return result;
        }

        [HttpGet]
        [Route("api/TaskPriorities/itemsbyprioritylistid/{priorityListId}")]
        public List<TaskPriorityListItemModel> GetPriorityListItemsByPriorityListId(int priorityListId)
        {
            List<TaskPriorityListItemModel> result = _itemsService.GetTaskPriorityListItemsByPriorityListId(priorityListId);
            return result;
        }


        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        [Route("api/TaskPriorities/user/{userId}")]
        public SingleResult<TaskPriorityList> GetTaskPriorityListByUserId(int id)
        {
            SingleResult<TaskPriorityList> result = SingleResult.Create(_listService.GetUserlist(id));
            return result;
        }

        [HttpGet]
        public IQueryable<TaskPriorityList> GetTaskPriorityListById(int id)
        {
            return _listService.GetTasksListById(id);
        }

        [Route("api/TaskPriorities/{organizationId}/{departmentId?}/{teamId?}/{userId?}")]
        [EnableQuery(MaxExpansionDepth = 4)]
        [HttpGet]
        public IHttpActionResult GetByOrganizationId(int organizationId, int? departmentId, int? teamId, int? userId)
        {
            IQueryable<TaskPriorityList> taskPriorityList = _listService.Get(organizationId, departmentId, teamId, userId);
            if (taskPriorityList == null || taskPriorityList.Count() == 0)
            {
                return Ok(HttpStatusCode.NotFound); 
            }
            SingleResult<TaskPriorityList> result = SingleResult.Create(taskPriorityList);
            return Ok(result);
        }


        [HttpPost]
        [Route("api/TaskPriorities/{organizationId}/{departmentId?}/{teamId?}/{userId?}/list")]
        public IHttpActionResult CreateFromDefaultTemplate(int organizationId, int? departmentId, int? teamId, int? userId)
        {
            int listId = _listService.CreateFromDefaultTemplate(organizationId, departmentId, teamId, userId);

            return Ok(listId);
        }

        [HttpPost]
        [Route("api/TaskPriorities/listItem")]
        public IHttpActionResult Add(TaskPriorityListItem item)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TaskPriorityListItem result = _itemsService.Add(item);

            return Ok(item.Id);
        }

        
        [HttpPut]
        [Route("api/TaskPriorities/listItem")]
        public IHttpActionResult Update(TaskPriorityListItem item)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TaskPriorityListItem obj = _itemsService.GetTasksListById(item.Id).FirstOrDefault();

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
        [Route("api/TaskPriorities/listItem/{id}")]
        public IHttpActionResult Delete(int id)
        {
            try
            {
                TaskPriorityListItem task = _itemsService.GetTasksListById(id).FirstOrDefault();
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