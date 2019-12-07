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
    public class TaskCategoriesController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        ITaskCategoryListsService _listService;
        ITaskCategoryListItemsService _itemsService;
        IUserService _userService;
        public TaskCategoriesController(ITaskCategoryListsService listService, ITaskCategoryListItemsService itemsService, IUserService userService)
        {
            _listService = listService;
            _itemsService = itemsService;
            _userService = userService;
        }


        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        [Route("api/TaskCategories/items")]
        public IQueryable<TaskCategoryListItem> Get()
        {
            return _itemsService.Get();
        }

        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        [Route("api/TaskCategories/{id}")]
        public SingleResult<TaskCategoryList> GetTasksListById(int id)
        {
            SingleResult<TaskCategoryList> result = SingleResult.Create(_listService.GetTasksListById(id));
            return result;
        }
        [HttpGet]
        [Route("api/TaskCategories/itemsbycategorieslistid/{categoriesListId}")]
        public List<TaskCategoriesListItemModel> GetCategoriesListItemsByCategoriesListId(int categoriesListId)
        {
            List<TaskCategoriesListItemModel> result = _itemsService.GetCategoriesListItemsByCategoriesListId(categoriesListId);
            return result;
        }


        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        [Route("api/TaskCategories/user/{userId}")]
        public SingleResult<TaskCategoryList> GetTaskCategoryListByUserId(int id)
        {
            SingleResult<TaskCategoryList> result = SingleResult.Create(_listService.GetUserlist(id));
            return result;
        }

        [Route("api/TaskCategories/{organizationId}/{departmentId?}/{teamId?}/{userId?}")]
        [EnableQuery(MaxExpansionDepth = 4)]
        [HttpGet]
        public IHttpActionResult GetByOrganizationId(int organizationId, int? departmentId, int? teamId, int? userId)
        {

            IQueryable<TaskCategoryList> taskCategoryList = _listService.Get(organizationId, departmentId, teamId, userId);
            if (taskCategoryList == null || taskCategoryList.Count() == 0)
            {
                return Ok(HttpStatusCode.NotFound); 
            }
            SingleResult<TaskCategoryList> result = SingleResult.Create(taskCategoryList);
            return Ok(result);
        }


        [HttpPost]
        [Route("api/TaskCategories/{organizationId}/{departmentId?}/{teamId?}/{userId?}/list")]
        public IHttpActionResult CreateFromDefaultTemplate(int organizationId, int? departmentId, int? teamId, int? userId)
        {
            int listId = _listService.CreateFromDefaultTemplate(organizationId, departmentId, teamId, userId);

            return Ok(listId);
        }

        [HttpPost]
        [Route("api/TaskCategories/listItem")]
        public IHttpActionResult Add(TaskCategoryListItem item)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TaskCategoryListItem result = _itemsService.Add(item);

            return Ok(item.Id);
        }

        
        [HttpPut]
        [Route("api/TaskCategories/listItem")]
        public IHttpActionResult Update(TaskCategoryListItem item)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TaskCategoryListItem obj = _itemsService.GetTasksListById(item.Id).FirstOrDefault();

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
        [Route("api/TaskCategories/listItem/{id}")]
        public IHttpActionResult Delete(int id)
        {
            try
            {
                TaskCategoryListItem task = _itemsService.GetTasksListById(id).FirstOrDefault();
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