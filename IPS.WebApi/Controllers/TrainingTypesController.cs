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
    public class TrainingTypesController : BaseController
    {
        ITrainingTypeService _trainingTypeService;


        public TrainingTypesController(ITrainingTypeService trainingTypeService)
        {
            _trainingTypeService= trainingTypeService;
        }


        [EnableQuery]
        [HttpGet]
        public IQueryable<TrainingType> GetTrainingTypes()
        {
            return _trainingTypeService.Get();
        }

        [HttpGet]
        [Route("api/TrainingTypes/GetDDL")]
        public List<IPSDropDown> GetDDL()
        {
            return _trainingTypeService.GetDDL();
        }

        [EnableQuery]
        public SingleResult<TrainingType> GetTrainingType(int id)
        {
            SingleResult<TrainingType> result = SingleResult.Create(_trainingTypeService.GetById(id));

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(TrainingType trainingType)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            TrainingType result = _trainingTypeService.Add(trainingType);

            return Ok(trainingType.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(TrainingType trainingType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TrainingType org = _trainingTypeService.GetById(trainingType.Id).FirstOrDefault();

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _trainingTypeService.Update(trainingType);

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
            TrainingType trainingType = _trainingTypeService.GetById(id).FirstOrDefault();
            if (trainingType == null)
            {
                return NotFound();
            }

            bool result = _trainingTypeService.Delete(trainingType);

            return Ok(result);
        }
    }
}