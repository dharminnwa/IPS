using IPS.Business;
using IPS.Data;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.OData;


namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class TaskScaleController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        ITaskScaleService _taskScaleService;

        public TaskScaleController(ITaskScaleService scaleService)
        {
            _taskScaleService = scaleService;
        }


        [HttpGet]
        [EnableQuery]
        public IQueryable<TaskScale> Get()
        {
            return _taskScaleService.Get();
        }

        [HttpGet]
        [EnableQuery]
        public SingleResult GetTaskScale(int id)
        {
            SingleResult<TaskScale> result = SingleResult.Create(_taskScaleService.GetById(id));

            /*if (result.Queryable.FirstOrDefault() == null)
            {
                return NotFound();
            }*/

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(TaskScale scale)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            TaskScale result = _taskScaleService.Add(scale);

            return Ok(scale.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(TaskScale scale)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TaskScale taskScale = _taskScaleService.GetById(scale.Id).FirstOrDefault();

            if (taskScale == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _taskScaleService.Update(scale);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }


        }

        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {
            TaskScale taskScale = _taskScaleService.GetById(id).FirstOrDefault();
            if (taskScale == null)
            {
                return NotFound();
            }

            bool result = _taskScaleService.Delete(taskScale);

            return Ok(result);
        }


        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        [Route("api/TaskScaleDetail/{organizationId}/{departmentId?}/{teamId?}/{userId?}")]
        public IHttpActionResult GetTaskScaleDetail(int organizationId, int? departmentId, int? teamId, int? userId)
        {
            IQueryable<TaskScale> taskScale = _taskScaleService.GetDetail(organizationId, departmentId, teamId, userId);
            if (taskScale == null)
            {
                return Ok(HttpStatusCode.NotFound);
            }
            SingleResult<TaskScale> result = SingleResult.Create(taskScale);
            return Ok(result);
        }


        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        [Route("api/TaskScaleRatings/{userId?}")]
        public IHttpActionResult GetTaskScaleRatings(int? userId)
        {
            IQueryable<TaskScale> taskScale = _taskScaleService.GetTaskScaleRatings(userId);
            if (taskScale == null)
            {
                return Ok(HttpStatusCode.NotFound);
            }
            SingleResult<TaskScale> result = SingleResult.Create(taskScale);
            return Ok(result);
        }

    }
}