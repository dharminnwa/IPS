using IPS.Business;
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
    public class MeasureUnitController : BaseController
    {
        IMeasureUnitService _measureUnitService;

        public MeasureUnitController(IMeasureUnitService measureUnitService)
        {
            _measureUnitService = measureUnitService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<MeasureUnit> GetMeasureUnits()
        {
            return _measureUnitService.Get();
        }

        public IHttpActionResult GetMeasureUnit(int id)
        {
            MeasureUnit result = _measureUnitService.GetById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public IHttpActionResult Add(MeasureUnit measureUnit)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            MeasureUnit result = _measureUnitService.Add(measureUnit);

            return Ok(measureUnit.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(MeasureUnit measureUnit)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            MeasureUnit org = _measureUnitService.GetById(measureUnit.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _measureUnitService.Update(measureUnit);

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
            MeasureUnit measureUnit = _measureUnitService.GetById(id);
            if (measureUnit == null)
            {
                return NotFound();
            }

            bool result = _measureUnitService.Delete(measureUnit);

            return Ok(result);
        }
        
    }
}