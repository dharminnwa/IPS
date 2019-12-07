using IPS.Business;
using IPS.Business.Interfaces;
using IPS.BusinessModels.AnswerModel;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class AnswersController : BaseController
    {
        private static readonly string[] DefaultSeparators = { ";" };
        IAnswersService _answersService;
        IEvaluationStatusService _evaluationStatusService;

        public AnswersController(IAnswersService answersService, IEvaluationStatusService evaluationStatusService)
        {
            _answersService = answersService;
            _evaluationStatusService = evaluationStatusService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<Answer> GetAnswers()
        {
            return _answersService.GetAnswers();
        }


        [EnableQuery]
        public SingleResult<Answer> GetAnswers(int id)
        {
            SingleResult<Answer> result = SingleResult.Create(_answersService.GetAnswerById(id));

            return result;
        }

        [HttpPost]
        public IHttpActionResult AddAnswer(Answer[] answers)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (answers != null && answers.Length > 0)
            {
                Answer[] result = _answersService.AddAnswer(answers);

                _evaluationStatusService.SetEvaluationStatus((int)answers[0].StageId, null, (int)answers[0].ParticipantId);

                return Ok(HttpStatusCode.OK);
            }
            return BadRequest("List of answers to be added is empty!");
        }

        [HttpPut]
        public IHttpActionResult Update(Answer[] answers)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string result = _answersService.UpdateAnswer(answers);

            if (result != "OK")
            {

                return BadRequest(result);
            }
            else
            {
                return Ok(HttpStatusCode.OK);
            }


        }

        [HttpGet]
        [Route("api/Answers/GetAnswersByParticipantIds/{participantIds}/{stageId}")]
        public List<IpsAnswerModel> GetAnswersByParticipantIds(string participantIds,int stageId)
        {
            List<IpsAnswerModel> result = new List<IpsAnswerModel>();
            List<int> ids = GetParamsFromString(participantIds, DefaultSeparators);
            foreach (int id in ids)
            {
                List<IpsAnswerModel> participantAnswers = _answersService.GetAnswersByParticipantId(id, stageId);
                if (participantAnswers.Count() > 0)
                {
                    result.AddRange(participantAnswers);
                }
            }
            return result;
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