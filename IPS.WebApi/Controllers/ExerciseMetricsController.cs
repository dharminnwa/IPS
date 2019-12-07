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
    public class ExerciseMetricsController : BaseController
    {
        IExerciseMetricsService _exerciseMetricsService;


        public ExerciseMetricsController(IExerciseMetricsService exerciseMetricsService)
        {
            _exerciseMetricsService = exerciseMetricsService;
        }


        [EnableQuery]
        [HttpGet]
        public IQueryable<ExerciseMetric> GetExerciseMetrics()
        {
            return _exerciseMetricsService.Get();
        }

        [HttpGet]
        [Route("api/ExerciseMetric/GetDDL")]
        public List<IPSDropDown> GetDDL()
        {
            return _exerciseMetricsService.GetDDL();
        }

        [EnableQuery(MaxExpansionDepth = 8)]
        public SingleResult<ExerciseMetric> GetExerciseMetric(int id)
        {
            SingleResult<ExerciseMetric> result = SingleResult.Create(_exerciseMetricsService.GetById(id));

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(ExerciseMetric exerciseMetric)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            ExerciseMetric result = _exerciseMetricsService.Add(exerciseMetric);

            return Ok(exerciseMetric.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(ExerciseMetric exerciseMetric)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ExerciseMetric org = _exerciseMetricsService.GetById(exerciseMetric.Id).FirstOrDefault();

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _exerciseMetricsService.Update(exerciseMetric);

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
            ExerciseMetric exerciseMetric = _exerciseMetricsService.GetById(id).FirstOrDefault();
            if (exerciseMetric == null)
            {
                return NotFound();
            }

            bool result = _exerciseMetricsService.Delete(exerciseMetric);

            return Ok(result);
        }
    }
}