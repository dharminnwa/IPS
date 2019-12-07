using IPS.Business;
using IPS.Data;
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
    public class ScaleRangeController : BaseController
    {
        IScaleRangeService _scaleRangeService;

        public ScaleRangeController(IScaleRangeService scaleRangeService)
        {
            _scaleRangeService = scaleRangeService;
        }

        [EnableQuery]
        [HttpGet]
        public IQueryable<ScaleRange> GetScales()
        {
            return _scaleRangeService.Get();
        }


        public IHttpActionResult GetScale(int id)
        {
            ScaleRange result = _scaleRangeService.GetById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public IHttpActionResult Add(ScaleRange scaleRange)
        {
            if (!ModelState.IsValid){

                return BadRequest(ModelState);
            }

            ScaleRange result = _scaleRangeService.Add(scaleRange);

            return Ok(scaleRange.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(ScaleRange scaleRange)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ScaleRange org = _scaleRangeService.GetById(scaleRange.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _scaleRangeService.Update(scaleRange);
                
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
            ScaleRange scaleRange = _scaleRangeService.GetById(id);
            if (scaleRange == null)
            {
                return NotFound();
            }

            bool result = _scaleRangeService.Delete(scaleRange);

            return Ok(result);
        }
    }
}