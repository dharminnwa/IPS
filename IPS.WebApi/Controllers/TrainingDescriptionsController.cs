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
using System.Web.Script.Serialization;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class TrainingDescriptionsController : BaseController
    {
        ITrainingDescriptionService _trainingDescriptionService;


        public TrainingDescriptionsController(ITrainingDescriptionService trainingDescriptionService)
        {
            _trainingDescriptionService = trainingDescriptionService;
        }


        [EnableQuery]
        [HttpGet]
        public IQueryable<TrainingDescription> GetTrainingDescriptions()
        {
            return _trainingDescriptionService.Get();
        }

        [HttpGet]
        [Route("api/TrainingDescriptions/GetTrainingDescriptionsBySkillId/{skillId}")]
        public List<TrainingDescription> GetTrainingDescriptionsBySkillId(int skillId)
        {
            return _trainingDescriptionService.GetTrainingDescriptionsBySkillId(skillId);
        }

        [EnableQuery]
        public SingleResult<TrainingDescription> GetTrainingDescription(int id)
        {
            SingleResult<TrainingDescription> result = SingleResult.Create(_trainingDescriptionService.GetById(id));

            return result;

        }

        [HttpPost]
        public IHttpActionResult Add(TrainingDescription trainingDescription)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            TrainingDescription result = _trainingDescriptionService.Add(trainingDescription);

            return Ok(trainingDescription.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(TrainingDescription trainingDescription)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TrainingDescription org = _trainingDescriptionService.GetById(trainingDescription.Id).FirstOrDefault();

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _trainingDescriptionService.Update(trainingDescription);

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
            TrainingDescription trainingDescription = _trainingDescriptionService.GetById(id).FirstOrDefault();
            if (trainingDescription == null)
            {
                return NotFound();
            }

            bool result = _trainingDescriptionService.Delete(trainingDescription);

            return Ok(result);
        }
    }
}