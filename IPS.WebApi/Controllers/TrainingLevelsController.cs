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
    public class TrainingLevelsController : BaseController
    {
        ITrainingLevelService _trainingLevelService;


        public TrainingLevelsController(ITrainingLevelService trainingLevelService)
        {
            _trainingLevelService= trainingLevelService;
        }


        [EnableQuery]
        [HttpGet]
        public IQueryable<TrainingLevel> GetTrainingLevels()
        {
            return _trainingLevelService.Get();
        }

        [HttpGet]
        [Route("api/TrainingLevel/GetDDL")]
        public List<IPSDropDown> GetDDL()
        {
            return _trainingLevelService.GetDDL();
        }

        [EnableQuery]
        public SingleResult<TrainingLevel> GetTrainingLevel(int id)
        {
            SingleResult<TrainingLevel> result = SingleResult.Create(_trainingLevelService.GetById(id));

            return result;

        }

        [HttpPost]
        public IHttpActionResult Add(TrainingLevel trainingLevel)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            TrainingLevel result = _trainingLevelService.Add(trainingLevel);

            return Ok(trainingLevel.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(TrainingLevel trainingLevel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TrainingLevel org = _trainingLevelService.GetById(trainingLevel.Id).FirstOrDefault();

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _trainingLevelService.Update(trainingLevel);

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
            TrainingLevel trainingLevel = _trainingLevelService.GetById(id).FirstOrDefault();
            if (trainingLevel == null)
            {
                return NotFound();
            }

            bool result = _trainingLevelService.Delete(trainingLevel);

            return Ok(result);
        }
    }
}