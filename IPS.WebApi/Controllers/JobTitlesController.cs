using IPS.Business;
using IPS.BusinessModels.Common;
using IPS.Data;
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
    public class JobTitlesController : BaseController
    {
        IJobPositionService _jobPositionService;

        public JobTitlesController(IJobPositionService jobPositionService)
        {
            _jobPositionService = jobPositionService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<JobPosition> GetJobPositions()
        {
            return _jobPositionService.Get();
        }

        [HttpGet]
        [Route("api/JobPosition/GetDDL")]
        public List<IPSDropDown> GetDDL()
        {
            return _jobPositionService.GetDDL();
        }

        public IHttpActionResult GetJobPosition(int id)
        {
            JobPosition result = _jobPositionService.GetById(id);
            
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public IHttpActionResult Add(JobPosition jobPosition)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            JobPosition result = _jobPositionService.Add(jobPosition);

            return Ok(jobPosition.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(JobPosition jobPosition)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            JobPosition org = _jobPositionService.GetById(jobPosition.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _jobPositionService.Update(jobPosition);

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
            JobPosition jobPosition = _jobPositionService.GetById(id);
            if (jobPosition == null)
            {
                return NotFound();
            }

            bool result = _jobPositionService.Delete(jobPosition);

            return Ok(result);
        }
      
        
    }
}