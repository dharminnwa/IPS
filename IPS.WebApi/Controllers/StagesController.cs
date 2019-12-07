using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
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
    public class StagesController : BaseController
    {
        private static readonly string[] DefaultSeparators = { ";" };

        IStagesService _stagesService;
        ISurveyService _surveyService;

        public StagesController(IStagesService stagesService, ISurveyService surveyService)
        {
            _stagesService = stagesService;
            _surveyService = surveyService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<Stage> GetStages()
        {
            return _stagesService.Get();
        }

   
        [EnableQuery]
        public SingleResult<Stage> GetStages(int id)
        {
            SingleResult<Stage> result = SingleResult.Create(_stagesService.GetById(id));

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(Stage stage)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Stage result = _stagesService.Add(stage);

            return Ok(stage.Id);
        }

        [HttpPut]
        public IHttpActionResult Update(Stage stage)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Stage obj = _stagesService.GetById(stage.Id).FirstOrDefault();

            if (obj == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _stagesService.Update(stage);

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
            Stage stage = _stagesService.GetById(id).FirstOrDefault();
            if (stage == null)
            {
                return NotFound();
            }

            string result = _stagesService.Delete(stage);
            if (result != "OK")
            {
                
                return BadRequest(result);
            }
            else
            {
                return Ok(HttpStatusCode.OK);
            }
        }

        [Route("api/Stages/survey_info/{stageId}/{participantId?}")]
        [HttpGet]
        public IpsSurveyInfo GetStageSurveyInfo(int stageId, int participantId)
        {
            return _surveyService.GetSurveyInfo(stageId, participantId);
        }

        [Route("api/Stages/survey_participant_full_name/{participantId}")]
        [HttpGet]
        public string GatSurveyParticipantFullName(int participantId) 
        {
            return _surveyService.GetParticipantFullName(participantId);
        }

        private List<int> GetParamsFromString(string input, string[] separators)
        {
            var inputStrArray = input.Split(separators, StringSplitOptions.RemoveEmptyEntries);
            var result = new List<int>();
            foreach (var inputPart in inputStrArray)
            {
                int intId;
                if (int.TryParse(inputPart, out intId))
                {
                    result.Add(intId);
                }
            }
            return result;
        }
    }
}