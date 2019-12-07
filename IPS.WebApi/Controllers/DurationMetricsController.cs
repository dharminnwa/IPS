using IPS.Business;
using IPS.BusinessModels.Common;
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
using System.Web.Script.Serialization;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class DurationMetricsController : BaseController
    {
        IDurationMetricsService _durationMetricsService;


        public DurationMetricsController(IDurationMetricsService durationMetricsService)
        {
            _durationMetricsService = durationMetricsService;
        }


        [EnableQuery]
        [HttpGet]
        public IQueryable<DurationMetric> GetDurationMetrics()
        {
            return _durationMetricsService.Get();
        }

        [HttpGet]
        [Route("api/DurationMetric/GetDDL")]
        public List<IPSDropDown> GetDDL()
        {
            return _durationMetricsService.GetDDL();
        }

        [EnableQuery(MaxExpansionDepth = 8)]
        public SingleResult<DurationMetric> GetDurationMetric(int id)
        {
            SingleResult<DurationMetric> result = SingleResult.Create(_durationMetricsService.GetById(id));

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(DurationMetric durationMetric)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            DurationMetric result = _durationMetricsService.Add(durationMetric);

            return Ok(durationMetric.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(DurationMetric durationMetric)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            DurationMetric org = _durationMetricsService.GetById(durationMetric.Id).FirstOrDefault();

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _durationMetricsService.Update(durationMetric);

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
            DurationMetric durationMetric = _durationMetricsService.GetById(id).FirstOrDefault();
            if (durationMetric == null)
            {
                return NotFound();
            }

            bool result = _durationMetricsService.Delete(durationMetric);

            return Ok(result);
        }
    }
}