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
    public class ScalesController : BaseController
    {
        IScaleService _scaleService;

        public ScalesController(IScaleService scaleService)
        {
            _scaleService = scaleService;
        }

        [EnableQuery]
        [HttpGet]
        public IQueryable<Scale> GetScales()
        {
            return _scaleService.Get();
        }

        [EnableQuery]
        public SingleResult GetScale(int id)
        {
            SingleResult<Scale> result = SingleResult.Create(_scaleService.GetById(id));

            /*if (result.Queryable.FirstOrDefault() == null)
            {
                return NotFound();
            }*/ 

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(Scale scale)
        {
            if (!ModelState.IsValid){

                return BadRequest(ModelState);
            }

            Scale result = _scaleService.Add(scale);

            return Ok(scale.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(Scale scale)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Scale org = _scaleService.GetById(scale.Id).FirstOrDefault();

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _scaleService.Update(scale);
                
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
            Scale scale = _scaleService.GetById(id).FirstOrDefault();
            if (scale == null)
            {
                return NotFound();
            }

            bool result = _scaleService.Delete(scale);

            return Ok(result);
        }
    }
}